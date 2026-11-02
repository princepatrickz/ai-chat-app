import React, { useEffect, useRef, useState } from "react";
import style from "../assets/styles/components/customSelect.module.scss";

const CustomSelect = ({ label, data, errorMessage, ...props }) => {
  return (
    <>
      <div className={style["input-group"]}>
        <div className={style["mui-select"]}>
          <select {...props} required>
            <option value=""></option>
            {data.map((item) => (
              <option key={item.id} value={item.id}>
                {item.value}
              </option>
            ))}
          </select>

          <label>{label}</label>
        </div>
      </div>

      {errorMessage && <p>* {errorMessage}</p>}
    </>
  );
};

export default CustomSelect;
