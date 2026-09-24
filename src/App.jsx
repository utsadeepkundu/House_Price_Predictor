import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "";

const initialHouseForm = {
  city: "",
  locality: "",
  locality_tier: "",
  property_type: "",
  bhk: "",
  bathrooms: "",
  balconies: "",
  built_up_area: "",
  carpet_area: "",
  floor_number: "",
  total_floors: "",
  facing: "",
  furnishing_status: "",
  property_age: "",
  parking_spaces: "",
  transaction_type: "",
};


// ======================================================
// NUMERIC INPUT
// ======================================================

function NumericInput({
  name,
  label,
  placeholder,
  step = "1",
  feature,
  value,
  onChange,
}) {
  return (
    <div className="input-group">
      <label htmlFor={name}>{label}</label>

      <input
        id={name}
        name={name}
        type="number"
        step={step}
        min={feature?.min}
        max={feature?.max}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
      />

      {feature && (
        <span className="input-hint">
          Range: {feature.min} – {feature.max}
        </span>
      )}
    </div>
  );
}


// ======================================================
// SELECT INPUT
// ======================================================

function SelectInput({
  name,
  label,
  placeholder,
  options,
  value,
  onChange,
}) {
  return (
    <div className="input-group">
      <label htmlFor={name}>{label}</label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}


// ======================================================
// LOCALITY INPUT
// ======================================================

function LocalityInput({
  city,
  localities,
  value,
  onChange,
}) {
  return (
    <div className="input-group">
      <label htmlFor="locality">Locality</label>

      <select
        id="locality"
        name="locality"
        value={value}
        onChange={onChange}
        disabled={!city}
        required
      >
        <option value="">
          {!city
            ? "Select city first"
            : "Select locality"}
        </option>

        {localities.map((locality) => (
          <option key={locality} value={locality}>
            {locality}
          </option>
        ))}
      </select>

      {!city && (
        <span className="input-hint">
          Select a city first.
        </span>
      )}
    </div>
  );
}


// ======================================================
// MAIN APP
// ======================================================

function App() {
  const [activeTab, setActiveTab] = useState("house");

  // ====================================================
  // HOUSE MODEL DATA
  // ====================================================

  const [metadata, setMetadata] = useState(null);
  const [locationMapping, setLocationMapping] = useState({});

  // ====================================================
  // RENT MODEL DATA
  // ====================================================

  const [rentMetadata, setRentMetadata] = useState(null);

  // ====================================================
  // LOADING / ERROR
  // ====================================================

  const [metadataLoading, setMetadataLoading] =
    useState(true);

  const [metadataError, setMetadataError] =
    useState("");

  // ====================================================
  // HOUSE FORM
  // ====================================================

  const [houseForm, setHouseForm] =
    useState(initialHouseForm);

  const [houseLoading, setHouseLoading] =
    useState(false);

  const [housePrediction, setHousePrediction] =
    useState(null);

  const [houseError, setHouseError] =
    useState("");

  // ====================================================
  // RENT FORM
  // ====================================================

  const [rentArea, setRentArea] = useState("");

  const [rentLoading, setRentLoading] =
    useState(false);

  const [rentPrediction, setRentPrediction] =
    useState(null);

  const [rentError, setRentError] =
    useState("");


  // ====================================================
  // LOAD MODEL METADATA
  // ====================================================

  useEffect(() => {
    const loadAllMetadata = async () => {
      try {
        setMetadataLoading(true);
        setMetadataError("");

        const [
          houseResponse,
          locationResponse,
          rentResponse,
        ] = await Promise.all([
          fetch("/model_metadata.json"),
          fetch("/location_mapping.json"),
          fetch("/rent_metadata.json"),
        ]);

        if (!houseResponse.ok) {
          throw new Error(
            "Could not load house model metadata."
          );
        }

        if (!locationResponse.ok) {
          throw new Error(
            "Could not load location mapping."
          );
        }

        if (!rentResponse.ok) {
          throw new Error(
            "Could not load rent model metadata."
          );
        }

        const houseData =
          await houseResponse.json();

        const locationData =
          await locationResponse.json();

        const rentData =
          await rentResponse.json();

        setMetadata(houseData);
        setLocationMapping(locationData);
        setRentMetadata(rentData);

      } catch (error) {
        console.error(
          "Metadata loading error:",
          error
        );

        setMetadataError(
          error.message ||
            "Unable to load model information."
        );

      } finally {
        setMetadataLoading(false);
      }
    };

    loadAllMetadata();
  }, []);


  // ====================================================
  // HOUSE HELPERS
  // ====================================================

  const getHouseFeature = (name) => {
    return metadata?.features?.[name] || null;
  };

  const getHouseOptions = (name) => {
    return (
      getHouseFeature(name)?.values || []
    );
  };

  const getLocalityOptions = () => {
    if (!houseForm.city) {
      return [];
    }

    return (
      locationMapping[houseForm.city] || []
    );
  };


  // ====================================================
  // HOUSE INPUT HANDLER
  // ====================================================

  const handleHouseChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setHouseForm((previous) => {
      const updated = {
        ...previous,
        [name]: value,
      };

      if (name === "city") {
        updated.locality = "";
      }

      return updated;
    });

    setHousePrediction(null);
    setHouseError("");
  };


  // ====================================================
  // HOUSE RESET
  // ====================================================

  const resetHouseForm = () => {
    setHouseForm(initialHouseForm);
    setHousePrediction(null);
    setHouseError("");
  };


  // ====================================================
  // HOUSE PREDICTION
  // ====================================================

  const handleHousePredict = async (event) => {
    event.preventDefault();

    setHouseLoading(true);
    setHousePrediction(null);
    setHouseError("");

    try {
      const response = await fetch(
        `${API_URL}/api/predict/house`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            city: houseForm.city,
            locality: houseForm.locality,
            locality_tier:
              houseForm.locality_tier,
            property_type:
              houseForm.property_type,

            bhk: Number(houseForm.bhk),
            bathrooms:
              Number(houseForm.bathrooms),
            balconies:
              Number(houseForm.balconies),

            built_up_area:
              Number(houseForm.built_up_area),

            carpet_area:
              Number(houseForm.carpet_area),

            floor_number:
              Number(houseForm.floor_number),

            total_floors:
              Number(houseForm.total_floors),

            facing: houseForm.facing,

            furnishing_status:
              houseForm.furnishing_status,

            property_age:
              Number(houseForm.property_age),

            parking_spaces:
              Number(houseForm.parking_spaces),

            transaction_type:
              houseForm.transaction_type,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "House price prediction failed."
        );
      }

      setHousePrediction(
        data.predicted_price_lakhs
      );

    } catch (error) {
      console.error(
        "House prediction error:",
        error
      );

      setHouseError(
        error.message ||
          "Unable to predict house price."
      );

    } finally {
      setHouseLoading(false);
    }
  };


  // ====================================================
  // RENT PREDICTION
  // ====================================================

  const handleRentPredict = async (event) => {
    event.preventDefault();

    setRentLoading(true);
    setRentPrediction(null);
    setRentError("");

    try {
      const response = await fetch(
        `${API_URL}/api/predict/rent`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            area: Number(rentArea),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Rent prediction failed."
        );
      }

      setRentPrediction(
        data.predicted_rent
      );

    } catch (error) {
      console.error(
        "Rent prediction error:",
        error
      );

      setRentError(
        error.message ||
          "Unable to predict rent."
      );

    } finally {
      setRentLoading(false);
    }
  };


  // ====================================================
  // RENT RESET
  // ====================================================

  const resetRentForm = () => {
    setRentArea("");
    setRentPrediction(null);
    setRentError("");
  };


  // ====================================================
  // FORMAT HOUSE PRICE
  // ====================================================

  const formatHousePrice = (lakhs) => {
    const value = Number(lakhs);

    if (value >= 100) {
      return `₹${(value / 100).toFixed(2)} Crore`;
    }

    return `₹${value.toFixed(2)} Lakh`;
  };


  // ====================================================
  // FORMAT RENT
  // ====================================================

  const formatRent = (rent) => {
    return Number(rent).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    );
  };


  // ====================================================
  // RENT RANGE
  // ====================================================

  const rentFeature =
    rentMetadata?.features?.area || null;


  // ====================================================
  // SWITCH TAB
  // ====================================================

  const changeTab = (tab) => {
    setActiveTab(tab);

    setHousePrediction(null);
    setHouseError("");

    setRentPrediction(null);
    setRentError("");
  };


  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="app">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <header className="navbar">

        <div className="logo">

          <span className="logo-icon">
            ⌂
          </span>

          <span>
            RealEstate AI
          </span>

        </div>

        <div className="nav-status">

          <span className="status-dot"></span>

          ML Prediction Platform

        </div>

      </header>


      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="container">

        {/* HERO */}

        <section className="hero">

          <div className="hero-badge">
            AI-POWERED REAL ESTATE PREDICTION
          </div>

          <h1>
            Predict Real Estate
            <span> Prices Instantly</span>
          </h1>

          <p>
            Estimate property sale prices,
            rental prices, and land values
            using machine learning.
          </p>

        </section>


        {/* ==================================================
            PREDICTION CARD
        ================================================== */}

        <section className="prediction-card">

          {/* TABS */}

          <div className="tabs">

            <button
              type="button"
              className={
                activeTab === "house"
                  ? "tab active"
                  : "tab"
              }
              onClick={() =>
                changeTab("house")
              }
            >
              🏠 House Price
            </button>


            <button
              type="button"
              className={
                activeTab === "rent"
                  ? "tab active"
                  : "tab"
              }
              onClick={() =>
                changeTab("rent")
              }
            >
              🏢 Rent
            </button>


            <button
              type="button"
              className={
                activeTab === "land"
                  ? "tab active"
                  : "tab"
              }
              onClick={() =>
                changeTab("land")
              }
            >
              🌳 Land Price
            </button>

          </div>


          {/* ==================================================
              GLOBAL LOADING
          ================================================== */}

          {metadataLoading && (
            <div className="status-panel">

              <div className="loader"></div>

              <h2>
                Loading prediction models...
              </h2>

              <p>
                Loading model metadata and
                prediction configuration.
              </p>

            </div>
          )}


          {/* ==================================================
              GLOBAL ERROR
          ================================================== */}

          {!metadataLoading &&
            metadataError && (
              <div className="status-panel error-panel">

                <h2>
                  Unable to load model data
                </h2>

                <p>
                  {metadataError}
                </p>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    window.location.reload()
                  }
                >
                  Reload
                </button>

              </div>
            )}


          {/* ==================================================
              HOUSE PRICE
          ================================================== */}

          {!metadataLoading &&
            !metadataError &&
            activeTab === "house" && (

              <form
                className="form-section"
                onSubmit={
                  handleHousePredict
                }
              >

                <div className="section-title">

                  <h2>
                    House Price Prediction
                  </h2>

                  <p>
                    Enter the property details
                    below.
                  </p>

                </div>


                <div className="form-grid">

                  {/* CITY */}

                  <SelectInput
                    name="city"
                    label="City"
                    placeholder="Select city"
                    options={
                      getHouseOptions(
                        "city"
                      )
                    }
                    value={
                      houseForm.city
                    }
                    onChange={
                      handleHouseChange
                    }
                  />


                  {/* LOCALITY */}

                  <LocalityInput
                    city={
                      houseForm.city
                    }
                    localities={
                      getLocalityOptions()
                    }
                    value={
                      houseForm.locality
                    }
                    onChange={
                      handleHouseChange
                    }
                  />


                  {/* LOCALITY TIER */}

                  <SelectInput
                    name="locality_tier"
                    label="Locality Tier"
                    placeholder="Select tier"
                    options={
                      getHouseOptions(
                        "locality_tier"
                      )
                    }
                    value={
                      houseForm.locality_tier
                    }
                    onChange={
                      handleHouseChange
                    }
                  />


                  {/* PROPERTY TYPE */}

                  <SelectInput
                    name="property_type"
                    label="Property Type"
                    placeholder="Select type"
                    options={
                      getHouseOptions(
                        "property_type"
                      )
                    }
                    value={
                      houseForm.property_type
                    }
                    onChange={
                      handleHouseChange
                    }
                  />


                  {/* BHK */}

                  <NumericInput
                    name="bhk"
                    label="BHK"
                    placeholder="e.g. 3"
                    feature={
                      getHouseFeature(
                        "bhk"
                      )
                    }
                    value={
                      houseForm.bhk
                    }
                    onChange={
                      handleHouseChange
                    }
                  />


                  {/* BATHROOMS */}

                  <NumericInput
                    name="bathrooms"
                    label="Bathrooms"
                    placeholder="e.g. 2"
                    feature={
                      getHouseFeature(
                        "bathrooms"
                      )
                    }
                    value={
                      houseForm.bathrooms
                    }
                    onChange={
                      handleHouseChange
                    }
                  />


                  {/* BALCONIES */}

                  <NumericInput
                    name="balconies"
                    label="Balconies"
                    placeholder="e.g. 1"
                    feature={
                      getHouseFeature(
                        "balconies"
                      )
                    }
                    value={
                      houseForm.balconies
                    }
                    onChange={
                      handleHouseChange
                    }
                  />


                  {/* BUILT UP AREA */}

                  <NumericInput
                    name="built_up_area"
                    label="Built-up Area (sq ft)"
                    placeholder="e.g. 1500"
                    step="0.01"
                    feature={
                      getHouseFeature(
                        "built_up_area"
                      )
                    }
                    value={
                      houseForm.built_up_area
                    }
                    onChange={
                      handleHouseChange
                    }
                  />


                  {/* CARPET AREA */}

                  <NumericInput
                    name="carpet_area"
                    label="Carpet Area (sq ft)"
                    placeholder="e.g. 1200"
                    step="0.01"
                    feature={
                      getHouseFeature(
                        "carpet_area"
                      )
                    }
                    value={
                      houseForm.carpet_area
                    }
                    onChange={
                      handleHouseChange
                    }
                  />


                  {/* FLOOR */}

                  <NumericInput
                    name="floor_number"
                    label="Floor Number"
                    placeholder="e.g. 5"
                    feature={
                      getHouseFeature(
                        "floor_number"
                      )
                    }
                    value={
                      houseForm.floor_number
                    }
                    onChange={
                      handleHouseChange
                    }
                  />


                  {/* TOTAL FLOORS */}

                  <NumericInput
                    name="total_floors"
                    label="Total Floors"
                    placeholder="e.g. 15"
                    feature={
                      getHouseFeature(
                        "total_floors"
                      )
                    }
                    value={
                      houseForm.total_floors
                    }
                    onChange={
                      handleHouseChange
                    }
                  />


                  {/* FACING */}

                  <SelectInput
                    name="facing"
                    label="Facing"
                    placeholder="Select facing"
                    options={
                      getHouseOptions(
                        "facing"
                      )
                    }
                    value={
                      houseForm.facing
                    }
                    onChange={
                      handleHouseChange
                    }
                  />


                  {/* FURNISHING */}

                  <SelectInput
                    name="furnishing_status"
                    label="Furnishing Status"
                    placeholder="Select status"
                    options={
                      getHouseOptions(
                        "furnishing_status"
                      )
                    }
                    value={
                      houseForm.furnishing_status
                    }
                    onChange={
                      handleHouseChange
                    }
                  />


                  {/* AGE */}

                  <NumericInput
                    name="property_age"
                    label="Property Age (years)"
                    placeholder="e.g. 5"
                    feature={
                      getHouseFeature(
                        "property_age"
                      )
                    }
                    value={
                      houseForm.property_age
                    }
                    onChange={
                      handleHouseChange
                    }
                  />


                  {/* PARKING */}

                  <NumericInput
                    name="parking_spaces"
                    label="Parking Spaces"
                    placeholder="e.g. 1"
                    feature={
                      getHouseFeature(
                        "parking_spaces"
                      )
                    }
                    value={
                      houseForm.parking_spaces
                    }
                    onChange={
                      handleHouseChange
                    }
                  />


                  {/* TRANSACTION */}

                  <SelectInput
                    name="transaction_type"
                    label="Transaction Type"
                    placeholder="Select type"
                    options={
                      getHouseOptions(
                        "transaction_type"
                      )
                    }
                    value={
                      houseForm.transaction_type
                    }
                    onChange={
                      handleHouseChange
                    }
                  />

                </div>


                {/* HOUSE BUTTONS */}

                <div className="button-row">

                  <button
                    type="button"
                    className="reset-button"
                    onClick={
                      resetHouseForm
                    }
                    disabled={houseLoading}
                  >
                    Reset
                  </button>


                  <button
                    type="submit"
                    className="predict-button"
                    disabled={houseLoading}
                  >
                    {houseLoading
                      ? "Predicting..."
                      : "Predict House Price"}
                  </button>

                </div>


                {/* HOUSE ERROR */}

                {houseError && (
                  <div className="error-message">

                    <strong>
                      Prediction Error
                    </strong>

                    <span>
                      {houseError}
                    </span>

                  </div>
                )}


                {/* HOUSE RESULT */}

                {housePrediction !== null && (
                  <div className="result-card">

                    <div className="result-label">
                      Estimated Property Price
                    </div>

                    <h2>
                      {formatHousePrice(
                        housePrediction
                      )}
                    </h2>

                    <div className="result-value">
                      ₹
                      {Number(
                        housePrediction
                      ).toFixed(2)}
                      {" "}
                      Lakhs
                    </div>

                    <div className="result-note">
                      Prediction generated using
                      Linear Regression
                    </div>

                  </div>
                )}

              </form>
            )}


          {/* ==================================================
              RENT
          ================================================== */}

          {!metadataLoading &&
            !metadataError &&
            activeTab === "rent" && (

              <form
                className="form-section"
                onSubmit={
                  handleRentPredict
                }
              >

                <div className="section-title">

                  <h2>
                    Rent Prediction
                  </h2>

                  <p>
                    Estimate monthly rent based
                    on property area.
                  </p>

                </div>


                <div className="form-grid">

                  <NumericInput
                    name="rent_area"
                    label="Property Area (sq ft)"
                    placeholder="e.g. 2000"
                    step="0.01"
                    feature={rentFeature}
                    value={rentArea}
                    onChange={(event) => {
                      setRentArea(
                        event.target.value
                      );

                      setRentPrediction(
                        null
                      );

                      setRentError("");
                    }}
                  />

                </div>


                <div className="button-row">

                  <button
                    type="button"
                    className="reset-button"
                    onClick={
                      resetRentForm
                    }
                    disabled={rentLoading}
                  >
                    Reset
                  </button>


                  <button
                    type="submit"
                    className="predict-button"
                    disabled={rentLoading}
                  >
                    {rentLoading
                      ? "Predicting..."
                      : "Predict Monthly Rent"}
                  </button>

                </div>


                {/* RENT ERROR */}

                {rentError && (
                  <div className="error-message">

                    <strong>
                      Prediction Error
                    </strong>

                    <span>
                      {rentError}
                    </span>

                  </div>
                )}


                {/* RENT RESULT */}

                {rentPrediction !== null && (
                  <div className="result-card">

                    <div className="result-label">
                      Estimated Monthly Rent
                    </div>

                    <h2>
                      {formatRent(
                        rentPrediction
                      )}
                    </h2>

                    <div className="result-value">
                      For {rentArea} sq ft
                    </div>

                    <div className="result-note">
                      Prediction generated using
                      Linear Regression
                    </div>

                  </div>
                )}

              </form>
            )}


          {/* ==================================================
              LAND
          ================================================== */}

          {!metadataLoading &&
            !metadataError &&
            activeTab === "land" && (

              <div className="coming-soon">

                <div className="coming-icon">
                  🌳
                </div>

                <h2>
                  Land Price Prediction
                </h2>

                <p>
                  The land-price model will be
                  added here after we prepare
                  the land dataset.
                </p>

              </div>
            )}

        </section>

      </main>


      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer>
        <p>
          Built with React • FastAPI •
          Scikit-learn
        </p>
      </footer>

    </div>
  );
}

export default App;