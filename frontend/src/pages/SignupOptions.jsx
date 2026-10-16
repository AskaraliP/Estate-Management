import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBasket, Sprout, Users } from "lucide-react";

import EstateCarousel from "../components/EstateCarousel";
import "../styles/Login.css";

export default function SignupOptions() {
  return (
    <section className="signup-options-page">
      <EstateCarousel />

      <section className="login-column-card signup-options-card">
        <div className="login-heading">
          <div className="login-heading-icon green-accent">
            <Sprout size={22} />
          </div>

          <p className="login-form-eyebrow">JOIN RUBBER ESTATE</p>

          <h1>Create your account</h1>

          <p className="login-heading-description">
            Choose the account that matches your work.
          </p>
        </div>

        <div className="login-register-links-split">
          <Link
            to="/register/estate-owner"
            className="login-reg-card-split"
          >
            <span className="login-reg-icon">
              <Sprout size={21} />
            </span>

            <span className="login-reg-text">
              <strong>Estate Owner</strong>
              <span>Manage your estate and workers</span>
            </span>

            <ArrowRight
              className="login-reg-arrow"
              size={17}
              aria-hidden="true"
            />
          </Link>

          <Link to="/register/labour" className="login-reg-card-split">
            <span className="login-reg-icon">
              <Users size={21} />
            </span>

            <span className="login-reg-text">
              <strong>Labour</strong>
              <span>Track work and daily wages</span>
            </span>

            <ArrowRight
              className="login-reg-arrow"
              size={17}
              aria-hidden="true"
            />
          </Link>

          <Link to="/register/buyer" className="login-reg-card-split">
            <span className="login-reg-icon">
              <ShoppingBasket size={21} />
            </span>

            <span className="login-reg-text">
              <strong>B2B Buyer</strong>
              <span>Browse rubber stock and place orders</span>
            </span>

            <ArrowRight
              className="login-reg-arrow"
              size={17}
              aria-hidden="true"
            />
          </Link>
        </div>

        <p className="login-copyright">
          © {new Date().getFullYear()} Rubber Estate Management System
        </p>
      </section>
    </section>
  );
}
