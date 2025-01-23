import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // a plugin 


const videoSchema = new Schema(
    {
        videFile:{
            type:String, // cloudinary url
            required:true
        },
        thumbnail:{
            type:String, // cloudinary url
            required:true
        },
        title:{
            type:String, // cloudinary url
            required:true
        },
        descrption:{
            type:String, // cloudinary url
            required:true
        },
        duration:{
            type:Number,
            required:true
        },
        views:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }

    },
    {
        timestamps:true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)


export const Video = mongoose.model(Video,videoSchema)

// why "V" because we have created a refernce 