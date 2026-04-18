"use client";

import React from "react";
import { AuthProvider } from "../context/AuthContext";

type Props = {
  children: React.ReactNode;
};

export default function ClientWrapper({ children }: Props) {
  return <AuthProvider>{children}</AuthProvider>;
}
