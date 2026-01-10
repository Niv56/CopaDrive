import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Auth/Auth.css";

import { getProfilePicture } from "../../utils/profileUtils.js";

import Step1, { validateStep1 } from "./steps/Step1.jsx";
import Step2, { validateStep2 } from "./steps/Step2.jsx";
import Step3, { validateStep3 } from "./steps/Step3.jsx";
import Step4, { validateStep4 } from "./steps/Step4.jsx";

import logo from "../../photos/logo.svg";

const STEP_CONFIG = {
  1: {
    title: "Create a Copa Account",
    subtitle: "Enter your name",
    validate: validateStep1,
  },
  2: {
    title: "Basic information",
    subtitle: "Add a profile picture and phone number",
    validate: validateStep2,
  },
  3: {
    title: "Basic information",
    subtitle: "Enter your date of birth and gender",
    validate: validateStep3,
  },
  4: {
    title: "Create your Copa Account",
    subtitle: "Enter your email and create a password",
    validate: validateStep4,
  },
};

const TOTAL_STEPS = 4;
const API_URL = "http://localhost:3000/api/users";

const Register = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    image: null,

    dateOfBirth: "",
    gender: "",

    email: "",
    password: "",
    verifyPassword: "",
  });

  const validateCurrentStep = () => {
    const stepErrors = STEP_CONFIG[step].validate(formData);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const submitRegistration = async () => {
    try {
      const profilePicture = await getProfilePicture(
        formData.image,
        formData.firstName,
        formData.lastName
      );

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          email: formData.email,
          password: formData.password,
          profilePicture,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/login");
      } else {
        const errorMessage =
          data.error || data.message || "Registration failed. Please try again.";
        setErrors({ submit: errorMessage });
      }
    } catch (error) {
      setErrors({
        submit: "Server connection error. Ensure the backend is running.",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateCurrentStep()) return;

    if (step === TOTAL_STEPS) {
      await submitRegistration();
    } else {
      setErrors({});
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step === 1) return;
    setErrors({});
    setStep((s) => s - 1);
  };

  const renderStep = () => {
    const stepProps = { formData, setFormData, errors };

    switch (step) {
      case 1:
        return <Step1 {...stepProps} />;
      case 2:
        return (
          <Step2
            {...stepProps}
            preview={preview}
            setPreview={setPreview}
            fileInputRef={fileInputRef}
          />
        );
      case 3:
        return <Step3 {...stepProps} />;
      case 4:
        return <Step4 {...stepProps} />;
      default:
        return null;
    }
  };

  const currentConfig = STEP_CONFIG[step];

  return (
    <div className="copa-auth-container">
      <div className="copa-auth-card">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center gap-2">
           <img src={logo} alt="CopaDrive" className="copa-logo" />

            <span className="copa-brand-text">Copadrive</span>
          </div>

          <h1 className="h4 mt-3 mb-1">{currentConfig.title}</h1>
          <div className="text-secondary">{currentConfig.subtitle}</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="d-grid gap-3">
          {renderStep()}

          {errors.submit && (
            <div className="alert alert-danger py-2 mb-0">{errors.submit}</div>
          )}

          {/* Actions */}
          <div className="d-flex justify-content-between align-items-center mt-2">
            {step === 1 ? (
              <Link to="/login" className="btn btn-outline-secondary rounded-pill px-3">
                Sign in instead
              </Link>
            ) : (
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-3"
                onClick={handleBack}
              >
                Back
              </button>
            )}

            <button type="submit" className="btn btn-primary btn-lg rounded-pill px-4">
              {step < TOTAL_STEPS ? "Next" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
