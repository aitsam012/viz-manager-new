import { supabase } from '../lib/supabase';
import { User } from '../types/user';

export class AuthService {
  static async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });

    if (error) throw error;
    return data;
  }

  static async signIn(email: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: 'password'
    });

    if (error) throw new Error('No active account found for that email');

    if (data.user) {
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);
    }

    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (userError) throw userError;
    if (!userData) return null;

    // Then get project assignments separately to avoid recursion
    const { data: assignments, error: assignmentsError } = await supabase
      .from('project_assignments')
      .select('project_id, can_view, can_edit, editable_sections')
      .eq('user_id', user.id);

    if (assignmentsError) throw assignmentsError;

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      isActive: userData.is_active,
      avatar: userData.avatar,
      hasAllProjects: userData.has_all_projects,
      lastLogin: userData.last_login,
      createdAt: userData.created_at,
      projectAssignments: (assignments || []).map((pa: any) => ({
        projectId: pa.project_id,
        permissions: {
          canView: pa.can_view,
          canEdit: pa.can_edit,
          editableSections: pa.editable_sections
        }
      }))
    };
  }

  static async updateUserProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        role: updates.role,
        is_active: updates.isActive,
        has_all_projects: updates.hasAllProjects,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async createUser(userData: Omit<User, 'id' | 'createdAt'>) {
    // This would typically be done through Supabase Admin API
    // For now, we'll just insert into the users table
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: userData.email,
        name: userData.name,
        role: userData.role,
        is_active: userData.isActive,
        avatar: userData.avatar,
        has_all_projects: userData.hasAllProjects
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteUser(userId: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
  }

  static async getAllUsers(): Promise<User[]> {
    // First get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;

    // Then get all project assignments
    const { data: allAssignments, error: assignmentsError } = await supabase
      .from('project_assignments')
      .select('user_id, project_id, can_view, can_edit, editable_sections');

    if (assignmentsError) throw assignmentsError;

    return (users || []).map((userData: any) => {
      const userAssignments = (allAssignments || []).filter(
        (assignment: any) => assignment.user_id === userData.id
      );

      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        isActive: userData.is_active,
        avatar: userData.avatar,
        hasAllProjects: userData.has_all_projects,
        lastLogin: userData.last_login,
        createdAt: userData.created_at,
        projectAssignments: userAssignments.map((pa: any) => ({
          projectId: pa.project_id,
          permissions: {
            canView: pa.can_view,
            canEdit: pa.can_edit,
            editableSections: pa.editable_sections
          }
        }))
      };
    });
  }

  static async updateProjectAssignments(userId: string, assignments: any) {
    // Delete existing assignments
    await supabase
      .from('project_assignments')
      .delete()
      .eq('user_id', userId);

    // Insert new assignments
    if (assignments.projectAssignments.length > 0) {
      const { error } = await supabase
        .from('project_assignments')
        .insert(
          assignments.projectAssignments.map((assignment: any) => ({
            user_id: userId,
            project_id: assignment.projectId,
            can_view: assignment.permissions.canView,
            can_edit: assignment.permissions.canEdit,
            editable_sections: assignment.permissions.editableSections
          }))
        );

      if (error) throw error;
    }

    // Update has_all_projects flag
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        has_all_projects: assignments.hasAllProjects,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;
  }
}