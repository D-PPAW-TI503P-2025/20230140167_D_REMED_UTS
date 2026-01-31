exports.isAdmin = (req, res, next) => {
  if (req.headers["x-user-role"] !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};


exports.isUser = (req, res, next) => {
  console.log("Borrow Request Headers:", JSON.stringify(req.headers, null, 2));

  const userRole = req.headers["x-user-role"];
  const userId = req.headers["x-user-id"];

  console.log("User Role:", userRole);
  console.log("User ID:", userId);

  // Allow access for both user and admin roles (admin can also borrow books)
  if ((userRole === "user" || userRole === "admin") && userId) {
    console.log("✅ Access granted for", userRole, "ID:", userId);
    next();
  } else {
    console.log("❌ Access denied - Role:", userRole, "UserID:", userId);
    return res.status(403).json({
      message: "Access denied. Please ensure you have 'x-user-role' (user/admin) and 'x-user-id' headers",
      received: {
        "x-user-role": userRole,
        "x-user-id": userId
      }
    });
  }
};
