var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  title: {
    type: String,
    required: true,
    index: { unique: true }
  },
  // link is a required string
  link: {
    type: String,
    required: true,
    index: { unique: true }
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  note: [{
    type: Schema.Types.ObjectId,
    ref: "Note"
  }]
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;