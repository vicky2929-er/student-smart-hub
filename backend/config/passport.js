const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

// Import all your models
const SuperAdmin = require("../model/superadmin");
const Institute = require("../model/institute");
const College = require("../model/college");
const Department = require("../model/department");
const Faculty = require("../model/faculty");
const Student = require("../model/student");

// Define the collections in priority order
const userCollections = [
  { model: SuperAdmin, role: "superadmin" },
  { model: Institute, role: "institute" },
  { model: College, role: "college" },
  { model: Department, role: "department" },
  { model: Faculty, role: "faculty" },
  { model: Student, role: "student" },
];

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        // Check each collection in priority order
        for (const collection of userCollections) {
          const user = await collection.model.findOne({ email: email });

          if (user) {
            // Verify password
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
              // Add role to user object
              const userWithRole = {
                ...user.toObject(),
                role: collection.role,
              };
              return done(null, userWithRole);
            } else {
              return done(null, false, { message: "Invalid password" });
            }
          }
        }

        // No user found in any collection
        return done(null, false, { message: "User not found" });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, { id: user._id, role: user.role });
});

passport.deserializeUser(async (userData, done) => {
  try {
    const collection = userCollections.find((c) => c.role === userData.role);
    const user = await collection.model.findById(userData.id);

    if (user) {
      user.role = userData.role;
      done(null, user);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
