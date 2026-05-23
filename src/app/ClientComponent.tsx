"use client";
import React, { useEffect } from "react";
import envConfig from "../config";

const ClientComponent = () => {
  useEffect(() => {
    console.log(envConfig);
  }, []);

  return <div>Client Component</div>;
};

export default ClientComponent;
