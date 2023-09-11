const Pool = require('pg').Pool;

export type ContractDB = {
    contract: string;
    deployer: string;
    data: Buffer;
    txhash: string;
    blockhash: string;
    blocknumber: string;
    verified: boolean;
    metadata: string;
}

export interface IContractDAO {
    getByContractAddr(address: string): Promise<ContractDB | null>;
    verifiedContract(address: string, isVerified: boolean, metadata: string, contractType: string): Promise<void>;
    dbPool: any;
}


export class ContractDAO implements IContractDAO {
    dbPool: any;

    constructor(dbPool: any){
        if (!dbPool){
            throw new Error("dbPool is required");
        }
        this.dbPool = dbPool;
    }

    async getByContractAddr(address: string): Promise<ContractDB | null> {
        try{
            const result = await this.dbPool.query('SELECT * FROM contracts WHERE contract = $1 LIMIT 1', [address]);
            if (result.rows.length > 0) {
                return result.rows[0];
            }
        }catch (e) {
            console.error(e)
        }

        return null;
    }

    async verifiedContract(address: string, isVerified: boolean, metadataBase64: string, contractType: string): Promise<void>{
        if (isVerified && !metadataBase64 ){
            throw new Error('Invalid params');
        }

        const contract = await this.getByContractAddr(address);

        if (!contract) {
            throw new Error('Contract not found');
        }

        let result;
        if (!isVerified){
            result = await this.dbPool.query('UPDATE contracts SET ' +
                '"verified" = $2, ' +
                '"metadata"= $3, ' +
                '"ctrtype"= $4 ' +
                'WHERE contract = $1',
                [address, false, "", ""]);
        }else{
            result = await this.dbPool.query('UPDATE contracts SET ' +
                '"verified" = $2, ' +
                '"metadata"= $3, ' +
                '"ctrtype"= $4 ' +
                'WHERE contract = $1',
                [address, true, metadataBase64, contractType]);
        }

        return result;
    }
}