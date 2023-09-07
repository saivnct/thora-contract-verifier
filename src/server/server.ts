import express from "express";
import serveIndex from "serve-index";
import cors from "cors";
import routes from "./routes";
import bodyParser from "body-parser";
import config from "../config";
import { SourcifyEventManager } from "../common/SourcifyEventManager/SourcifyEventManager";
import "../common/SourcifyEventManager/listeners/logger";
import genericErrorHandler from "./middlewares/GenericErrorHandler";
import notFoundHandler from "./middlewares/NotFoundError";
import session from "express-session";
import createMemoryStore from "memorystore";
import util from "util";
import {
  checkSourcifyChainId,
  checkSupportedChainId,
  sourcifyChainsArray,
} from "../sourcify-chains";
import {
  validateAddresses,
  validateSingleAddress,
  validateSourcifyChainIds,
} from "./common";
import * as OpenApiValidator from "express-openapi-validator";
import swaggerUi from "swagger-ui-express";
import yamljs from "yamljs";
import { resolveRefs } from "json-refs";
import { getAddress } from "ethers";
import { logger } from "../common/loggerLoki";
import { setLibSourcifyLogger } from "@ethereum-sourcify/lib-sourcify";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fileUpload = require("express-fileupload");
import { rateLimit } from "express-rate-limit";
import {services} from "./services/services";
import {ContractDAO} from "./services/ContractDAO";

const MemoryStore = createMemoryStore(session);

// here we override the standard LibSourcify's Logger with a custom one
setLibSourcifyLogger({
  // No need to set again the logger level because it's set here
  logLevel: process.env.NODE_ENV === "production" ? 3 : 4,
  setLevel(level: number) {
    this.logLevel = level;
  },
  log(level, msg) {
    if (level <= this.logLevel) {
      switch (level) {
        case 1:
          logger.error({
            labels: { event: "LibSourcify", level: "error" },
            message: msg,
          });
          break;
        case 2:
          logger.warn({
            labels: { event: "LibSourcify", level: "warn" },
            message: msg,
          });
          break;
        case 3:
          logger.info({
            labels: { event: "LibSourcify", level: "info" },
            message: msg,
          });
          break;
        case 4:
          logger.debug({
            labels: { event: "LibSourcify", level: "debug" },
            message: msg,
          });
          break;
      }
    }
  },
});

export class Server {
  app: express.Application;
  repository = config.repository.path;
  dbPool = services.dbPool;
  port: string | number;

  constructor(port?: string | number) {
    this.port = port || config.server.port;
    this.app = express();

    this.app.use(
      bodyParser.urlencoded({
        limit: config.server.maxFileSize,
        extended: true,
      })
    );
    this.app.use(bodyParser.json({ limit: config.server.maxFileSize }));

    this.app.use(
      fileUpload({
        limits: { fileSize: config.server.maxFileSize },
        abortOnLimit: true,
      })
    );

    // In every request support both chain and chainId
    this.app.use((req: any, res: any, next: any) => {
      if (req.body.chainId) {
        req.body.chain = req.body.chainId;
      }
      next();
    });

    this.app.use(
      OpenApiValidator.middleware({
        apiSpec: "openapi.yaml",
        validateRequests: true,
        validateResponses: false,
        ignoreUndocumented: true,
        fileUploader: false,
        validateSecurity: {
          handlers: {
            BearerAuth: async (req, scopes, schema) => {
              return true;
            },
          },
        },
        formats: [
          {
            name: "comma-separated-addresses",
            type: "string",
            validate: (addresses: string) => validateAddresses(addresses),
          },
          {
            name: "address",
            type: "string",
            validate: (address: string) => validateSingleAddress(address),
          },
          {
            name: "comma-separated-sourcify-chainIds",
            type: "string",
            validate: (chainIds: string) => validateSourcifyChainIds(chainIds),
          },
          {
            name: "supported-chainId",
            type: "string",
            validate: (chainId: string) => checkSupportedChainId(chainId),
          },
          {
            // "Sourcify chainIds" include the chains that are revoked verification support, but can have contracts in the repo.
            name: "sourcify-chainId",
            type: "string",
            validate: (chainId: string) => checkSourcifyChainId(chainId),
          },
          {
            name: "match-type",
            type: "string",
            validate: (matchType: string) =>
              matchType === "full_match" || matchType === "partial_match",
          },
        ],
      })
    );
    // checksum addresses in every request
    this.app.use((req: any, res: any, next: any) => {
      // stateless
      if (req.body.address) {
        req.body.address = getAddress(req.body.address);
      }
      // session
      if (req.body.contracts) {
        req.body.contracts.forEach((contract: any) => {
          contract.address = getAddress(contract.address);
        });
      }
      if (req.query.addresses) {
        req.query.addresses = req.query.addresses
          .split(",")
          .map((address: string) => getAddress(address))
          .join(",");
      }
      if (req.params.address) {
        req.params.address = getAddress(req.params.address);
      }
      next();
    });

    // if (
    //   process.env.NODE_ENV === "production" &&
    //   (process.env.TAG === "latest" || process.env.TAG === "stable")
    // )

    if (!config.testing){
      const limiter = rateLimit({
        windowMs: 15 * 1000,
        max: 3, // Requests per windowMs
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        message: {
          error:
              "You are sending too many verification requests, please slow down.",
        },
        keyGenerator: (req: any) => {
          if (req.headers["x-forwarded-for"]) {
            return req.headers["x-forwarded-for"].toString();
          }
          return req.ip;
        },
      });

      this.app.all("/session/verify/*", limiter);
      this.app.all("/verify*", limiter);
      this.app.all("/", limiter);
    }


    // Session API endpoints require non "*" origins because of the session cookies
    const sessionPaths = [
      "/session", // all paths /session/verify /session/input-files etc.
    ];
    this.app.use((req, res, next) => {
      // startsWith to match /session*
      if (sessionPaths.some((substr) => req.path.startsWith(substr))) {
        return cors({
          origin: config.corsAllowedOrigins,
          credentials: true,
        })(req, res, next);
      }
      // * for all non-session paths
      return cors({
        origin: "*",
      })(req, res, next);
    });

    // Need this for secure cookies to work behind a proxy. See https://expressjs.com/en/guide/behind-proxies.html
    // true means the leftmost IP in the X-Forwarded-* header is used.
    // Assuming the client ip is 2.2.2.2, reverse proxy 192.168.1.5
    // for the case "X-Forwarded-For: 2.2.2.2, 192.168.1.5", we want 2.2.2.2 to be used
    this.app.set("trust proxy", true);
    this.app.use(session(getSessionOptions()));

    this.app.get("/health", (_req, res) =>
      res.status(200).send("Alive and kicking!")
    );

    this.app.get("/chains", (_req, res) => {
      const sourcifyChains = sourcifyChainsArray.map(
          ({ rpc, name, title, chainId, supported }) => {
            // Don't publish providers
            // Don't show Alchemy & Infura IDs
            rpc = rpc.map((url) => {
              if (typeof url === "string") {
                return url;
              } else {
                // FetchRequest
                return url.url;
              }
            });
            return {
              name,
              title,
              chainId,
              rpc,
              supported,
            };
          }
      );

      res.status(200).json(sourcifyChains);
    });

    if (config.storingMode === "local"){
      this.app.use(
          "/repository",
          express.static(this.repository),
          serveIndex(this.repository, { icons: true })
      );
    }



    this.app.use("/", routes);
    this.app.use(genericErrorHandler);
    this.app.use(notFoundHandler);
  }

  async listen(callback?: () => void) {

    const promisified: any = util.promisify(this.app.listen);
    await promisified(this.port);



    if (callback) callback();
  }

  async loadSwagger(root: string) {
    const options = {
      filter: ["relative", "remote"],
      loaderOptions: {
        processContent: function (res: any, callback: any) {
          callback(null, yamljs.parse(res.text));
        },
      },
    };

    return resolveRefs(root as any, options).then(
      function (results: any) {
        return results.resolved;
      },
      function (err: any) {
        console.log(err.stack);
      }
    );
  }
}

function getSessionOptions(): session.SessionOptions {
  return {
    secret: config.session.secret,
    name: "sourcify_vid",
    rolling: true,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: config.session.maxAge,
      secure: config.session.secure,
      sameSite: "lax",
    },
    store: new MemoryStore({
      checkPeriod: config.session.maxAge,
    }),
  };
}

if (require.main === module) {
  const server = new Server();
  server
    .loadSwagger(yamljs.load("openapi.yaml"))
    .then((swaggerDocument: any) => {
      server.app.get("/api-docs/swagger.json", (req, res) =>
        res.json(swaggerDocument)
      );
      server.app.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerDocument, {
          customSiteTitle: "Thora Verifier API",
          customfavIcon: "https://sourcify.dev/favicon.ico",
        })
      );

      if (config.storingMode === "db" && server.dbPool){
        server.dbPool.connect().then(function (client: any) {
          console.log('Postgres Connected!');
        });
      }



      server.app.listen(server.port, () =>
        logger.info(`Server listening on port ${server.port}`)
      );
    });
}
