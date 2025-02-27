import  mongoose, {Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId, // one who is subsribing
        ref:"User"
    },
    channel:{
        type: Schema.Types.ObjectId, // one who is being subscribed to
        ref:"User"
    }

},{timestamps:true})

export const subscription =mongoose.model("subscription",subscriptionSchema)