const { mongo } = require("mongoose");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passwordValidator = require("password-validator");
const Role = require("../enum/role.enum");

exports.register = async (req, res) => {
  try {
    const { email, password, firstname, lastname, roles } = req.body;
    if (!email || !password || !firstname || !lastname) {
      return res.status(400).json({ message: "Des éléments obligatoires sont manquants" });
    }
    // Validate password
    const schema = new passwordValidator();
    schema
      .is()
      .min(8)
      .is()
      .max(16)
      .has()
      .uppercase()
      .has()
      .lowercase()
      .has()
      .digits()
      .has()
      .not()
      .spaces();
    if (!schema.validate(password)) {
      return res.status(400).json({
        message:
          "Le mot de passe doit contenir au moins 8 caractères, des lettres majuscules et minuscules, des chiffres, et ne doit pas contenir d'espaces",
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: `Impossible de créer un compte pour ${email}, cet email est déjà utilisé`,
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashPassword,
      firstname,
      lastname,
      roles: roles || [Role.ROLE_USER],
    });
    const userSaved = await newUser.save();
    const payload = {
      user: {
        id: userSaved._id,
        email: userSaved.email,
        roles: userSaved.roles,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.status(201).json({
      user: {
        _id: userSaved._id,
        email: userSaved.email,
        firstname: userSaved.firstname,
        lastname: userSaved.lastname,
        roles: userSaved.roles,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({ error: "Une erreur est survenue lors de l'inscription" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "L'email et le mot de passe sont obligatoires" });
    }
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "Identifiants invalides" });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Identifiants invalides" });
    }
    const payload = {
      user: {
        id: existingUser._id,
        email: existingUser.email,
        roles: existingUser.roles,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).json({
      user: {
        _id: existingUser._id,
        email: existingUser.email,
        firstname: existingUser.firstname,
        lastname: existingUser.lastname,
        roles: existingUser.roles,
        projectsOwned : existingUser.projectsOwned
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({ error: "Une erreur est survenue lors de la connexion" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Une erreur est survenue lors de la récupération du profil" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    const { firstname, lastname, email } = req.body;
    Object.assign(user, {
      ...(firstname && { firstname }),
      ...(lastname && { lastname }),
      ...(email && { email }),
    });
    res.status(200).json(await user.save());
  } catch (error) {
    return res.status(500).json({ error: "Une erreur est survenue lors de la mise à jour du profil" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Des champs sont manquants" });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "Le nouveau mot de passe doit être différent du mot de passe actuel",
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Le mot de passe actuel est incorrect" });
    }
    const schema = new passwordValidator();
    schema
      .is()
      .min(8)
      .is()
      .max(16)
      .has()
      .uppercase()
      .has()
      .lowercase()
      .has()
      .digits()
      .has()
      .not()
      .spaces();

    if (!schema.validate(newPassword)) {
      return res.status(400).json({
        message: "Le nouveau mot de passe ne respecte pas les exigences de sécurité",
      });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.status(200).json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    return res.status(500).json({ error: "Une erreur est survenue lors de la mise à jour du mot de passe" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: "Une erreur est survenue lors de la récupération des utilisateurs" });
  }
};
