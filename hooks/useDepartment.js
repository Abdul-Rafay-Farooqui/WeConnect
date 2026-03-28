"use client";

import { useState, useEffect } from "react";
import {
  getDepartments,
  createDepartment as createDept,
  deleteDepartment,
  getDeptMembers,
} from "../lib/supabase-api";

export function useDepartment(orgId) {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orgId) {
      setDepartments([]);
      setSelectedDept(null);
      return;
    }

    fetchDepartments();
  }, [orgId]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await getDepartments(orgId);
      setDepartments(data);
      if (data && data.length > 0 && !selectedDept) {
        setSelectedDept(data[0]);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching departments:", err);
    } finally {
      setLoading(false);
    }
  };

  const createDepartment = async (name, description) => {
    try {
      const newDept = await createDept(orgId, name, description);
      setDepartments([...departments, newDept]);
      setSelectedDept(newDept);
      return newDept;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteDept = async (deptId) => {
    try {
      await deleteDepartment(deptId);
      const updated = departments.filter((dept) => dept.id !== deptId);
      setDepartments(updated);
      if (selectedDept?.id === deptId) {
        setSelectedDept(updated.length > 0 ? updated[0] : null);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getMembers = async (deptId) => {
    try {
      return await getDeptMembers(deptId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    departments,
    selectedDept,
    setSelectedDept,
    loading,
    error,
    createDepartment,
    deleteDepartment: deleteDept,
    getMembers,
    refetch: fetchDepartments,
  };
}
