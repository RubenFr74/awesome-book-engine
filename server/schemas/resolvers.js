// import user model
const { User } = require("../models");
// import sign token function from auth
const { signToken } = require("../utils/auth");

const { AuthenticationError } = require("apollo-server-express");

const resolvers = {
  Query: {
    getMe: async (parent, args, context) => {
      const foundUser = await User.findOne({
        _id: context.user._id,
      });

      if (!foundUser) {
        // return res
        //   .status(400)
        //   .json({ message: "Cannot find a user with this id!" });
        throw new AuthenticationError("Something wrong happened!");
      }

      //   res.json(foundUser);
      return foundUser;
    },
  },
  Mutation: {
    createUser: async (parent, args, context) => {
      const user = await User.create(args);

      if (!user) {
        throw new AuthenticationError("Something wrong happened!");
      }
      const token = signToken(user);
      //   res.json({ token, user });
      return { token, user };
    },
    login: async (parent, args, context) => {
      const user = await User.findOne({
        email: args.email,
      });
      if (!user) {
        throw new AuthenticationError("Something wrong happened!");
      }

      const correctPw = await user.isCorrectPassword(args.password);

      if (!correctPw) {
        throw new AuthenticationError("Something wrong happened!");
      }
      const token = signToken(user);
      //   res.json({ token, user });
      return { token, user };
    },
    saveBook: async (parent, args, context) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: args.bookToSave } },
          { new: true, runValidators: true }
        );
        // return res.json(updatedUser);
        return updatedUser;
      } catch (err) {
        console.log(err);
        // return res.status(400).json(err);
        throw new AuthenticationError("Something wrong happened!");
      }
    },
    deleteBook: async (parent, args, context) => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId: args.bookId } } },
        { new: true }
      );
      if (!updatedUser) {
        throw new AuthenticationError("Something wrong happened!");
      }
      //   return res.json(updatedUser);
      return updatedUser;
    },
  },
};

module.exports = resolvers;