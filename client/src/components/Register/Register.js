import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfilePicture } from '../../utils/profileUtils';
import Step1, { validateStep1 } from './steps/Step1';
import Step2, { validateStep2 } from './steps/Step2';
import Step3, { validateStep3 } from './steps/Step3';
import './Register.css';
import logo from '../../logo.svg';

// Step configuration - moved outside component for better performance
const STEP_CONFIG = {
    1: {
        title: "Create a Copa Account",
        subtitle: "Enter your name",
        validate: validateStep1
    },
    2: {
        title: "Add your profile picture",
        subtitle: "Add a profile picture and phone number",
        validate: validateStep2
    },
    3: {
        title: "Create your Copa Account",
        subtitle: "Enter your email and create a password",
        validate: validateStep3
    }
};

const TOTAL_STEPS = 3;
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
        email: '',
        phoneNumber: '',
        password: '',
        verifyPassword: '',
        image: null
    });

    // Validate current step
    const validateCurrentStep = () => {
        const stepErrors = STEP_CONFIG[step].validate(formData);
        setErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };

    // Handle registration submission
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
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
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

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateCurrentStep()) {
            return;
        }

        if (step === TOTAL_STEPS) {
            await submitRegistration();
        } else {
            setStep(step + 1);
        }
    };

    // Handle back button
    const handleBack = () => {
        setStep(step - 1);
        setErrors({});
    };

    // Render current step component
    const renderStep = () => {
        const stepProps = {
            formData,
            setFormData,
            errors
        };

        switch (step) {
            case 1:
                return <Step1 {...stepProps} />;
            case 2:
                return <Step2 {...stepProps} preview={preview} setPreview={setPreview} fileInputRef={fileInputRef} />;
            case 3:
                return <Step3 {...stepProps} />;
            default:
                return null;
        }
    };

    const currentConfig = STEP_CONFIG[step];

    return (
        <div className="copa-register-container">
            <div className="copa-card shadow-sm">
                <div className="copa-left-side">
                    <img src={logo} alt="Copa Logo" width="75" className="mb-3" />
                    <h1 className="copa-title">{currentConfig.title}</h1>
                    <p className="copa-subtitle">{currentConfig.subtitle}</p>
                </div>

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
                                        className="btn-link-copa"
                                        onClick={() => navigate('/login')}
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
                                        className="btn-secondary-copa"
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