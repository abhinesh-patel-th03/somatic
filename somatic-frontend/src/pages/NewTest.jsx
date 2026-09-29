import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { getCow } from "../api/cowService";
import { getQuestions } from "../api/observationService";
import {
  startTest,
  submitObservations,
  startSensorTest,
} from "../api/testService";

import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";

export default function NewTest() {
  const { t } = useTranslation();

  const { cowId } = useParams();
  const navigate = useNavigate();

  const [cow, setCow] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [testId, setTestId] = useState(null);
  const [step, setStep] = useState("observations");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getCow(cowId),
      getQuestions(),
    ])
      .then(([cowData, questionData]) => {
        setCow(cowData.cow);
        setQuestions(questionData.questions || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [cowId]);

  const begin = async () => {
    setBusy(true);

    try {
      const result = await startTest(cowId);
      setTestId(result.test.testId);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    const payload = questions.map((q) => ({
      questionId: q.questionId,
      answer: answers[q.questionId],
    }));

    if (payload.some((a) => !a.answer)) {
      setError(t("answerEveryQuestion"));
      return;
    }

    setBusy(true);

    try {
      const result = await submitObservations(
        testId,
        payload
      );

      await startSensorTest(testId);

      navigate(
        `/tests/${result.test.testId}/progress`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Translate backend question text using question ID
  const getQuestionText = (question) => {
    const questionTranslations = {
      OBS_001: "questionOBS001",
      OBS_002: "questionOBS002",
      OBS_003: "questionOBS003",
      OBS_004: "questionOBS004",
    };

    const key =
      questionTranslations[question.questionId];

    return key ? t(key) : question.question;
  };

  if (loading) {
    return (
      <Loading text={t("preparingTest")} />
    );
  }

  if (!cow) {
    return (
      <ErrorBox
        message={error || t("cowNotFound")}
      />
    );
  }

  return (
    <div className="test-page">

      {/* Test Header */}
      <div className="test-top">
        <span className="eyebrow">
          {t("milkHealthAssessment")}
        </span>

        <h1>{cow.name}</h1>

        <p>
          {cow.cowId} ·{" "}
          {t("completeObservations")}
        </p>
      </div>

      <ErrorBox message={error} />

      {!testId ? (
        /* Start Test */
        <section className="panel test-start">

          <h2>
            {t("startNewTest")}
          </h2>

          <p>
            {t("testSessionDescription")}
          </p>

          <button
            className="primary-btn"
            onClick={begin}
            disabled={busy}
          >
            {busy
              ? t("starting")
              : t("startTest")}

            <ChevronRight size={17} />
          </button>

        </section>
      ) : (
        /* Observation Questions */
        <section className="panel">

          <div className="stepper">
            <span className="active">
              1. {t("observations")}
            </span>

            <span>
              2. {t("sensor")}
            </span>

            <span>
              3. {t("result")}
            </span>
          </div>

          <h2>
            {t("clinicalObservations")}
          </h2>

          <p className="muted">
            {t("observationInstruction")}
          </p>

          <div className="question-list">

            {questions.map((q) => (
              <div
                className="question"
                key={q.questionId}
              >

                <div>
                  <strong>
                    {getQuestionText(q)}
                  </strong>

                  {/* Keep backend ID visible */}
                  <small>
                    {q.questionId}
                  </small>
                </div>

                <div className="yesno">

                  {["NO", "YES"].map(
                    (value) => (
                      <button
                        key={value}
                        className={
                          answers[
                            q.questionId
                          ] === value
                            ? "selected"
                            : ""
                        }
                        onClick={() =>
                          setAnswers({
                            ...answers,
                            [q.questionId]:
                              value,
                          })
                        }
                      >

                        {answers[
                          q.questionId
                        ] === value && (
                          <Check size={14} />
                        )}

                        {value === "YES"
                          ? t("yes")
                          : t("no")}

                      </button>
                    )
                  )}

                </div>

              </div>
            ))}

          </div>

          <button
            className="primary-btn"
            disabled={busy}
            onClick={submit}
          >
            {busy
              ? t("submitting")
              : t("continueSensorTest")}

            <ChevronRight size={17} />
          </button>

        </section>
      )}

    </div>
  );
}