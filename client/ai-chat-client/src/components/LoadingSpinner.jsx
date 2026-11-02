import React from "react";
import { MoonLoader } from "react-spinners";
import { SyncLoader } from "react-spinners";
import { PulseLoader } from "react-spinners";

const LoadingSpinner = ({ isLoading, showBackDrop, centered, size, color }) => {
  const colors = {
    blue: "#0000A3",
    white: "#fff",
    red: "#E61A24",
    gray: "#6c757d",
  };

  return (
    <>
      {isLoading && (
        <div
          style={
            showBackDrop
              ? {
                  height: "105vh",
                  width: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: "9999",
                }
              : {
                  display: "flex",
                  alignContent: "center",
                  alignItems: "center",
                  justifyContent: "center",
                }
          }
        >
          <div
            style={{
              display: "flex",
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
              position: centered ? "absolute" : undefined,
              top: centered ? "50%" : undefined,
              left: centered ? "50%" : undefined,
              transform: centered ? "translate(-50%, -50%)" : undefined,
              zIndex: "9999",
            }}
          >
            {/* <MoonLoader
              color={colors[color]}
              loading={true}
              size={size}
              aria-label="Loading Spinner"
              data-testid="loader"
            /> */}
            <PulseLoader
              color={colors[color]}
              loading={true}
              size={size}
              speedMultiplier={0.5}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default LoadingSpinner;
