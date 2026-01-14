import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import "styles/pages/Auth.css";
import { getProfilePicture } from "shared/utils/profileUtils";

import Step1, { validateStep1 } from "./steps/Step1";
import Step2, { validateStep2 } from "./steps/Step2";
import Step3, { validateStep3 } from "./steps/Step3";
import Step4, { validateStep4 } from "./steps/Step4";
import Step5 from "./steps/Step5";

import logo from "assets/photos/logo.svg";
import ThemeToggle from "features/drive/widgets/ThemeToggle";

// ✅ ייבואים חדשים למוזיקה
import { FiMusic, FiPause } from "react-icons/fi";
import songFile from "assets/videos/Song.mp3"; 

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
  5: {
    title: "Welcome to Copa!",
    subtitle: "Your account has been created",
    validate: () => ({}),
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

  // ✅ לוגיקת נגינה (Play/Pause)
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggleSong = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(songFile);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.log(e));
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Validate current step
  const validateCurrentStep = () => {
    const stepErrors = STEP_CONFIG[step].validate(formData);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // Submit registration
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
        setStep(5);
      } else {
        const errorMessage =
          data.error || data.message || "Registration failed. Please try again.";
        setErrors({ submit: errorMessage });
      }
    } catch {
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
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step === 1 || step === 5) return;
    setErrors({});
    setStep((s) => s - 1);
  };

  const renderStep = () => {
    const stepProps = { formData, setFormData, errors };

    switch (step) {
      case 1: return <Step1 {...stepProps} />;
      case 2: return <Step2 {...stepProps} preview={preview} setPreview={setPreview} fileInputRef={fileInputRef} />;
      case 3: return <Step3 {...stepProps} />;
      case 4: return <Step4 {...stepProps} />;
      case 5: return <Step5 />;
      default: return null;
    }
  };

  const currentConfig = STEP_CONFIG[step];

  return (
    <div className="copa-auth-container" style={{ position: "relative" }}>
      
      <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 10, display: "flex", alignItems: "center", gap: "10px" }}>
        
        {/* כפתור PlaySong מנצנץ עם Play/Pause */}
        <button className="btn-sparkle" style={{ padding: "6px 16px", fontSize: "14px", marginTop: "0" }} onClick={toggleSong}>
            {isPlaying ? <FiPause style={{ marginRight: "6px" }} /> : <FiMusic style={{ marginRight: "6px" }} />}
            <span className="sparkle-text">{isPlaying ? "PauseSong" : "PlaySong"}</span>
            <div className="sparkle-stars">
              <div className="s-star s-1"></div>
              <div className="s-star s-2"></div>
            </div>
        </button>

        <ThemeToggle />
      </div>

      <div className="copa-auth-card">
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center gap-2">
            <img src={logo} alt="CopaDrive" className="copa-logo" />
            <span className="copa-brand-text">Copadrive</span>
          </div>

          <h1 className="h4 mt-3 mb-1">{currentConfig.title}</h1>
          <div className="text-secondary">{currentConfig.subtitle}</div>
        </div>

        <form onSubmit={handleSubmit} className="d-grid gap-3">
          {renderStep()}

          {errors.submit && <div className="alert alert-danger py-2 mb-0">{errors.submit}</div>}

          <div className="d-flex justify-content-between align-items-center mt-2">
            {step === 5 ? (
              <button
                type="button"
                className="btn btn-primary btn-lg rounded-pill w-100 btn-sparkle"
                onClick={() => navigate("/login")}
              >
                <span className="sparkle-text">Proceed to Login</span>
                <div className="sparkle-stars">
                  <div className="s-star s-1"></div>
                  <div className="s-star s-2"></div>
                  <div className="s-star s-3"></div>
                </div>
              </button>
            ) : (
              <>
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
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;