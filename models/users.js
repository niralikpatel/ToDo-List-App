const mongoose =  require('mongoose')
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')

const userSchema = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: {type: String, required: true},
})

//registering and making apssword hash
userSchema.pre('save', async function (next) {
    const user = this;
    if(!user.isModified('password')) return next();
    // let salt = await bcrypt.genSalt(10)
    const hashedPassword =  await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    next();
})

//will be used in login
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password)
}

module.exports = mongoose.model("User", userSchema);