const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {body, validationResult} = require('express-validator')
const config = require('config');
const User = require('../models/User');
const auth = require('../middleware/auth');


router.get('/', auth, async(req,res)=>{
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('')
    }
    
})

router.post('/', [
    body('email','Insert Valid Email').isEmail(),
    body('password', 'Invalid Password').exists()
], async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    
    const {email, password} = req.body;
    try {
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({msg:'Invalid Credentials'})
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({msg:'Invalid Credentials'})
        }

        const payload = {
            user:{
                id:user.id
            }
        }

        jwt.sign(payload,
             config.get('jwtSecret'),
             {expiresIn:36000},
             (err, token)=>{
                 if(err) throw(err);
                 res.json({token});
             })


        
    } catch (err) {
        console.error(err.message);
        res.status(500).json({msg:'Server Error'})
    } 
})



module.exports = router;