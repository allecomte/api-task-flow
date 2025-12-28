const { mongo } = require("mongoose");
const User = require("../models/user.model");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passwordValidator = require('password-validator');
const Role = require("../enum/role.enum");

exports.register = async (req, res) => {
    try {
        const { email, password, firstname, lastname, roles } = req.body;
        if(!email || !password || !firstname || !lastname){
            return res.status(400).json({ message: 'Required elements are missing' });
        }
        // Validate password
        const schema = new passwordValidator();
        schema
            .is().min(8)
            .is().max(16)
            .has().uppercase()
            .has().lowercase()
            .has().digits()
            .has().not().spaces();
        if(!schema.validate(password)){
            return res.status(400).json({ message: 'Password must be at least 8 characters long, contain uppercase and lowercase letters, digits, and no spaces' });
        }
        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(409).json({ message: `Can't create an account for ${email}, this email already used` });
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email,
            password: hashPassword,
            firstname,
            lastname,
            roles: roles || [ Role.ROLE_USER ]
        });
        await newUser.save();
        return res.status(201).json(newUser);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

exports.login = async (req, res) => {
    try{
        const { email, password } = req.body;
        if(!email || !password){
            return res.status(400).json({ message: 'Email and password are required' });
        }   
        const existingUser = await User.findOne({ email });
        if(!existingUser){
            return res.status(400).json({ message: 'Credentials invalid' });
        }
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if(!isPasswordCorrect){
            return res.status(400).json({ message: 'Credentials invalid' });
        }
        const payload = { user: {
                id: existingUser._id,
                email: existingUser.email,
                roles: existingUser.roles
        }};
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ user: existingUser, token });
    }catch(error){
        return res.status(500).json({ error });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ error });
    }
}