var mongoose = require('mongoose');

var ConfigurationSchema = new mongoose.Schema({
  logo: String,
  email : [{type: String, lowercase: true, unique: true, required: [false, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true}],
  couleur1: String,
  couleur2: String,
}, {timestamps: true});

// Requires population of author
ConfigurationSchema.methods.toJSONFor = function(){
  return {
    logo: this.logo,
    email: this.email,
    couleur1: this.couleur1,
    couleur2: this.couleur2,
    createdAt: this.createdAt,
  };
};

mongoose.model('Configuration', ConfigurationSchema);
