import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfilePicture } from '../../utils/profileUtils';

import Step1, { validateStep1 } from './steps/Step1';
import Step2, { validateStep2 } from './steps/Step2';
import Step3, { validateStep3 } from './steps/Step3';
import Step4, { validateStep4 } from './steps/Step4';


import './Register.css';
import '../Auth/Auth.css';
import logo from '../../photos/logo.svg';

// Step configuration
const STEP_CONFIG = {
  1: {
    title: "Create a Copa Account",
    subtitle: "Enter your name",
    validate: validateStep1
  },
  2: {
    title: "Basic information",
    subtitle: "Add a profile picture and phone number",
    validate: validateStep2
  },
  3: {
    title: "Basic information",
    subtitle: "Enter your date of birth and gender",
    validate: validateStep3
  },
  4: {
    title: "Create your Copa Account",
    subtitle: "Enter your email and create a password",
    validate: validateStep4
  }
};

const TOTAL_STEPS = 4;
const API_URL = 'http://localhost:3000/api/users';

const Register = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    image: null,

    dateOfBirth: '',
    gender: '',

    email: '',
    password: '',
    verifyPassword: ''
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,

          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,

          email: formData.email,
          password: formData.password,

          profilePicture
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Registration successful!");
        navigate('/login');
      } else {
        const errorMessage = data.error || data.message || "Registration failed. Please try again.";
        setErrors({ submit: errorMessage });
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setErrors({ submit: "Server connection error. Ensure the backend is running." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateCurrentStep()) return;

    if (step === TOTAL_STEPS) {
      await submitRegistration();
    } else {
      setErrors({});
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 1) return;
    setErrors({});
    setStep(step - 1);
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
    <div className="copa-register-container">
      <div className="copa-card shadow-sm">

        {/* Left side */}
        <div className="copa-left-side">
          <div className="copa-brand">
            <img src={logo} alt="CopaDrive" width="90" className="mb-4" />
            <span className="copa-wordmark">Copadrive</span>
          </div>

          <h1 className="copa-title">{currentConfig.title}</h1>
          <p className="copa-subtitle">{currentConfig.subtitle}</p>
        </div>

        {/* Right side */}
        <div className="copa-right-side">
          <form onSubmit={handleSubmit}>
            {renderStep()}

            {errors.submit && (
              <div className="text-danger mt-2">{errors.submit}</div>
            )}

            <div className="copa-action-bar mt-auto">
              {step === 1 ? (
                <div className="d-flex justify-content-end align-items-center gap-4 w-100">
                  <button
                    type="button"
                    className="btn-link-google text-decoration-none"
                    onClick={() => navigate("/login")}
                  >
                    Sign in instead
                  </button>

                  <button type="submit" className="btn-primary-copa">
                    Next
                  </button>
                </div>
              ) : (
                <div className="d-flex justify-content-between align-items-center w-100">
                  <button
                    type="button"
                    className="btn-link-google text-decoration-none"
                    onClick={handleBack}
                  >
                    Back
                  </button>

                  <button type="submit" className="btn-primary-copa">
                    {step < TOTAL_STEPS ? "Next" : "Submit"}
                  </button>
                </div>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default Register;
