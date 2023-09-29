import { useRef, useState, useEffect } from "react";
import {
  faCheck,
  faTimes,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "./api/axios";

// const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const USER_REGEX = /^[A-zA-Z][A-zA-Z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const REGISTER_URL = "/register";

const Register = () => {
  // allows us to set the focus on the user input when the component loads
  const userRef = useRef();
  // allows us to set the focus on the user input when we get an error to be announced by a screen reader for accessibility
  const errRef = useRef();

  // user input
  const [user, setUser] = useState("");
  // to check if the name is validated or not
  const [validName, setValidName] = useState(false);
  // to check if we have focused on an input field or not
  const [userFocus, setUserFocus] = useState(false);

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);

  // setting the focus when the component loads
  useEffect(() => {
    userRef.current.focus();
  }, []);

  // validating the username
  // checking for validation on change in username in input field
  useEffect(() => {
    setValidName(USER_REGEX.test(user));
  }, [user]);

  // validating the password
  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
    setValidMatch(pwd === matchPwd);
  }, [pwd, matchPwd]);

  // displaying an error message anytime the user changes the state of any of the input in the dependency array
  useEffect(() => {
    setErrMsg("");
  }, [user, pwd, matchPwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if button enabled with JS hack
    const v1 = USER_REGEX.test(user);
    const v2 = PWD_REGEX.test(pwd);
    if (!v1 || !v2) {
      setErrMsg("Invalid Entry");
      return;
    }
    try {
      const response = await axios.post(
        // url path
        REGISTER_URL,
        // the payload - the data we're sending
        JSON.stringify({ user, pwd }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: false,
        }
      );
      console.log(response?.data);
      console.log(response?.accessToken);
      console.log(JSON.stringify(response));
      setSuccess(true);
      //clear state and controlled inputs
      //need value attrib on inputs for this
      setUser("");
      setPwd("");
      setMatchPwd("");
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 409) {
        setErrMsg("Username Taken");
      } else {
        setErrMsg("Registration Failed");
      }
      // setting the focus on that error field for screen readers
      errRef.current.focus();
    }
  };

  return (
    <>
      {success ? (
        <section>
          <h1>Success!</h1>
          <p>
            <button>
              {/* <a href="#"> */}
              Sign In
              {/* </a> */}
            </button>
          </p>
        </section>
      ) : (
        <section>
          {/* what would hold an error if it exist */}
          <p
            ref={errRef}
            className={errMsg ? "errmsg" : "offscreen"}
            // assertive means when we set the focus on this element that has the ref of errRef, it will be announced with the screen reader and that is important if an error exist
            aria-live="assertive"
          >
            {errMsg}
          </p>
          <h1>Register</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">
              Username:
              <FontAwesomeIcon
                icon={faCheck}
                className={validName ? "valid" : "hide"}
              />
              <FontAwesomeIcon
                icon={faTimes}
                className={validName || !user ? "hide" : "invalid"}
              />
            </label>
            <input
              type="text"
              id="username"
              ref={userRef}
              // disabling previous value suggestions
              autoComplete="off"
              onChange={(e) => setUser(e.target.value)}
              value={user}
              required
              // it allows the screen reader announce wether this input field needs adjustment before the form is submitted
              aria-invalid={validName ? "false" : "true"}
              // this lets us provide another element that describes the input field
              // the screen reader will read the label first, then what type of input the label is addressing, then will also read the aria-invalid, then it will jump to the aria-describedby.
              // this is where we put in the requirements that our registration form needs and then have a screen-reader read them
              aria-describedby="uidnote"
              // if the user input field has focus
              onFocus={() => setUserFocus(true)}
              // if you have left the input field
              onBlur={() => setUserFocus(false)}
            />
            <p
              id="uidnote"
              className={
                userFocus && user && !validName ? "instructions" : "offscreen"
              }
            >
              <FontAwesomeIcon icon={faInfoCircle} />
              4 to 24 characters.
              <br />
              Must begin with a letter.
              <br />
              Letters, numbers, underscores, hyphens allowed.
            </p>

            <label htmlFor="password">
              Password:
              <FontAwesomeIcon
                icon={faCheck}
                className={validPwd ? "valid" : "hide"}
              />
              <FontAwesomeIcon
                icon={faTimes}
                className={validPwd || !pwd ? "hide" : "invalid"}
              />
            </label>
            <input
              type="password"
              id="password"
              onChange={(e) => setPwd(e.target.value)}
              value={pwd}
              required
              aria-invalid={validPwd ? "false" : "true"}
              aria-describedby="pwdnote"
              onFocus={() => setPwdFocus(true)}
              onBlur={() => setPwdFocus(false)}
            />
            <p
              id="pwdnote"
              className={pwdFocus && !validPwd ? "instructions" : "offscreen"}
            >
              <FontAwesomeIcon icon={faInfoCircle} />
              8 to 24 characters.
              <br />
              Must include uppercase and lowercase letters, a number and a
              special character.
              <br />
              Allowed special characters:{" "}
              <span aria-label="exclamation mark">!</span>{" "}
              <span aria-label="at symbol">@</span>{" "}
              <span aria-label="hashtag">#</span>{" "}
              <span aria-label="dollar sign">$</span>{" "}
              <span aria-label="percent">%</span>
            </p>

            <label htmlFor="confirm_pwd">
              Confirm Password:
              <span className={validMatch && matchPwd ? "valid" : "hide"}>
                <FontAwesomeIcon
                  icon={faCheck}
                  className={validMatch && matchPwd ? "valid" : "hide"}
                />
              </span>
              <span className={validMatch && matchPwd ? "hide" : "valid"}>
                <FontAwesomeIcon
                  icon={faTimes}
                  className={validMatch || !matchPwd ? "hide" : "invalid"}
                />
              </span>
            </label>
            <input
              type="password"
              id="confirm_pwd"
              onChange={(e) => setMatchPwd(e.target.value)}
              value={matchPwd}
              required
              aria-invalid={validMatch ? "false" : "true"}
              aria-describedby="confirmnote"
              onFocus={() => setMatchFocus(true)}
              onBlur={() => setMatchFocus(false)}
            />
            <p
              id="confirmnote"
              className={
                matchFocus && !validMatch ? "instructions" : "offscreen"
              }
            >
              <FontAwesomeIcon icon={faInfoCircle} />
              Must match the first password input field.
            </p>

            <button
              disabled={!validName || !validPwd || !validMatch ? true : false}
            >
              Sign Up
            </button>
          </form>
          <p>
            Already registered?
            <br />
            <span className="line">
              {/*put router link here*/}
              <button>
                {/* <a href="#"> */}
                Sign In
                {/* </a> */}
              </button>
            </span>
          </p>
        </section>
      )}
    </>
  );
};

export default Register;
