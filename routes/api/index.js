var router = require('express').Router();

router.use('/', require('./users'));
router.use('/profiles', require('./profiles'));
router.use('/tickets', require('./tickets'));
router.use('/tags', require('./tags'));
router.use('/client', require('./client'));
router.use('/upload', require('./upload'));
router.use('/public/uploads', require('./file'));

router.use(function(err, req, res, next){
  if(err.name === 'ValidationError'){
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function(errors, key){
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
});

module.exports = router;