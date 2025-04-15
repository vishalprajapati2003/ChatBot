import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { UserContext } from "../context/user.context";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [screenError, setScreenError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const checkScreen = () => {
      if (window.innerWidth < 230 || window.innerHeight < 430) {
        setScreenError(true);
      } else {
        setScreenError(false);
      }
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const submitHandler = (e) => {
    e.preventDefault();

    axios
      .post("/users/login", { email, password })
      .then((res) => {
        localStorage.setItem("token", res.data.token); // token remains in localStorage
        sessionStorage.setItem("user", JSON.stringify(res.data.user)); // user data in sessionStorage
        setUser(res.data.user);
        navigate("/");
      })
      .catch((err) => {
        console.log(err.response?.data || err.message);
      });
  };

  if (screenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100 p-4 text-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-red-700 max-w-xs w-full">
          <h1 className="text-xl font-semibold mb-2">Screen Too Small</h1>
          <p>
            Please use a device with a screen at least 270px wide and 470px
            tall.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-indigo-900 px-2 sm:px-4">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 p-4 sm:p-8 rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-sm">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 text-center drop-shadow-md">
          Login
        </h2>
        <form onSubmit={submitHandler} className="space-y-4">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs sm:text-sm font-medium text-white mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 sm:p-3 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs sm:text-sm font-medium text-white mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2 sm:p-3 pr-10 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-2 flex items-center text-white/70 hover:text-white"
              >
                {showPassword ? (
                  <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <EyeSlashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 sm:py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold hover:opacity-90 transition-all duration-200 shadow-lg text-sm sm:text-base"
          >
            Login
          </button>
        </form>

        {/* Register Link */}
        <p className="text-white/70 text-center mt-4 sm:mt-6 text-xs sm:text-sm">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-violet-300 hover:underline font-medium"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
