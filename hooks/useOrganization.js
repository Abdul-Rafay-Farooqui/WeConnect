"use client";

import { useState, useEffect } from "react";
import {
  getUserOrganizations,
  createOrganization as createOrg,
  deleteOrganization,
  getOrgMembers,
} from "../lib/supabase-api";

export function useOrganization() {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const data = await getUserOrganizations();
      setOrganizations(data);
      if (data && data.length > 0 && !selectedOrg) {
        setSelectedOrg(data[0]);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching organizations:", err);
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (name, icon, description) => {
    try {
      const newOrg = await createOrg(name, icon, description);
      setOrganizations([...organizations, newOrg]);
      setSelectedOrg(newOrg);
      return newOrg;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteOrg = async (orgId) => {
    try {
      await deleteOrganization(orgId);
      const updated = organizations.filter((org) => org.id !== orgId);
      setOrganizations(updated);
      if (selectedOrg?.id === orgId) {
        setSelectedOrg(updated.length > 0 ? updated[0] : null);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getMembers = async (orgId) => {
    try {
      return await getOrgMembers(orgId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    organizations,
    selectedOrg,
    setSelectedOrg,
    loading,
    error,
    createOrganization,
    deleteOrganization: deleteOrg,
    getMembers,
    refetch: fetchOrganizations,
  };
}
