'use client';

import { api } from './client';

export const OrganizationAPI = {
  listOrganizations: () => api.get('/organizations').then((r) => r.data),
  getOrganization: (organizationId: string) =>
    api.get(`/organizations/${organizationId}`).then((r) => r.data),
  createOrganization: (payload: { name: string; slug?: string }) =>
    api.post('/organizations', payload).then((r) => r.data),
  deleteOrganization: (organizationId: string) =>
    api.delete(`/organizations/${organizationId}`).then((r) => r.data),
  addOrganizationMembers: (organizationId: string, member_ids: string[]) =>
    api
      .post(`/organizations/${organizationId}/members`, { member_ids })
      .then((r) => r.data),
  createTeam: (
    organizationId: string,
    payload: { name: string; member_ids?: string[] },
  ) => api.post(`/organizations/${organizationId}/teams`, payload).then((r) => r.data),
  addTeamMembers: (
    organizationId: string,
    teamId: string,
    member_ids: string[],
  ) =>
    api
      .post(`/organizations/${organizationId}/teams/${teamId}/members`, { member_ids })
      .then((r) => r.data),
  deleteTeam: (organizationId: string, teamId: string) =>
    api
      .delete(`/organizations/${organizationId}/teams/${teamId}`)
      .then((r) => r.data),
  removeTeamMember: (organizationId: string, teamId: string, memberId: string) =>
    api
      .delete(`/organizations/${organizationId}/teams/${teamId}/members/${memberId}`)
      .then((r) => r.data),
  removeOrgMember: (organizationId: string, memberId: string) =>
    api
      .delete(`/organizations/${organizationId}/members/${memberId}`)
      .then((r) => r.data),
  createActivity: (organizationId: string, teamId: string, payload: { activity_type: string; preview_text?: string }) =>
    api
      .post(`/organizations/${organizationId}/teams/${teamId}/activities`, payload)
      .then((r) => r.data),
  deleteActivity: (organizationId: string, teamId: string, activityId: string) =>
    api
      .delete(`/organizations/${organizationId}/teams/${teamId}/activities/${activityId}`)
      .then((r) => r.data),
  createTask: (organizationId: string, teamId: string, payload: { title: string; description?: string; assignee_id?: string; priority?: string; due_date?: string }) =>
    api
      .post(`/organizations/${organizationId}/teams/${teamId}/tasks`, payload)
      .then((r) => r.data),
  deleteTask: (organizationId: string, teamId: string, taskId: string) =>
    api
      .delete(`/organizations/${organizationId}/teams/${teamId}/tasks/${taskId}`)
      .then((r) => r.data),
  getTeamWorkspace: (organizationId: string, teamId: string) =>
    api
      .get(`/organizations/${organizationId}/teams/${teamId}/workspace`)
      .then((r) => r.data),
};
