var mongoose = require('mongoose');

var ClientSchema = new mongoose.Schema({
  name: String,
}, {timestamps: true});

// Requires population of author
ClientSchema.methods.toJSONFor = function(user){
  return {
    id: this._id,
    name: this.body,
    createdAt: this.createdAt,
  };
};

mongoose.model('Client', ClientSchema);
