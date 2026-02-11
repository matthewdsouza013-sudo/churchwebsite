import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Body = () => {
  const navigate = useNavigate();
  const { userData } = useContext(AppContext);

  
  if (!userData) {
    return <p>Please login</p>;
  }

  const isVerified = userData.isVerified;
  const handleProtectedNav=(path)=>{
    if(!userData?.isVerified){
        toast.error("Please Login to use this feature")
        return ;
    }
    navigate(path);
  };
  return (
    <div>
      {!isVerified && (
        <p style={{ color: "red" }}>
          Please verify your email before accessing these features
        </p>
      )}

      {/* Quick-action buttons removed per request */}
    </div>
  );
};

export default Body;
