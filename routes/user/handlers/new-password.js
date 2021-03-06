const { validationResult } = require("express-validator");
const { checkPassword, hashPassword } = require("../../../helpers/password");
const User = require("../../../models/User");

module.exports = async function(req, res, title) {
  const { errors } = validationResult(req);

  if (errors.length > 0) {
    return res.render("pages/new-password", { ...title, errors });
  }

  const user = await User.findById(req.user._id);

  const { tempPassword, password } = req.body;

  if (tempPassword !== user.tempPassword) {
    return res.render("pages/new-password", {
      ...title,
      error: "Invalid temporary password."
    });
  }

  const same = await checkPassword(password, user.password);

  if (same) {
    return res.render("pages/new-password", {
      ...title,
      error: "New password matches old password."
    });
  }

  const hash = await hashPassword(password);

  await user.updateOne({
    password: hash,
    tempPassword: null,
    tempPasswordExpires: null
  });

  req.logout();
  req.flash("success", "Password updated, please login to confirm.");
  return res.redirect("/user/login");
};
