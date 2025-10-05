import mongoose,{Schema,Document} from "mongoose";

export interface IVault extends Document{
    userId:string;
    data:string;
    iv:string;
}
const vaultSchema : Schema<IVault> = new  Schema({
    userId:{type:String,required:true},
    data:{type:String,required:true},
    iv:{type:String,required:true}
},{timestamps:true});

export default mongoose.models.Vault || mongoose.model<IVault>("Vault",vaultSchema)

