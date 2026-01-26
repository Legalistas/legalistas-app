import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredRole?: string;
  requiredPermissions?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = null, 
  requiredRole,
  requiredPermissions 
}) => {
  const { isAuthenticated, loading, userInfo } = useAuth();

  // Mostrar loader mientras se valida autenticación
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Validando sesión...</Text>
      </View>
    );
  }

  // Si no está autenticado, mostrar fallback
  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  // Verificar rol si es requerido
  if (requiredRole && userInfo?.role !== requiredRole) {
    return (
      <View style={styles.accessDeniedContainer}>
        <Text style={styles.accessDeniedTitle}>Acceso Denegado</Text>
        <Text style={styles.accessDeniedText}>
          No tienes permisos para acceder a esta sección.
        </Text>
        <Text style={styles.accessDeniedSubtext}>
          Rol requerido: {requiredRole}
        </Text>
      </View>
    );
  }

  // Verificar permisos específicos si son requeridos
  if (requiredPermissions && requiredPermissions.length > 0) {
    const userPermissions = userInfo?.permissions || [];
    const hasPermission = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return (
        <View style={styles.accessDeniedContainer}>
          <Text style={styles.accessDeniedTitle}>Permisos Insuficientes</Text>
          <Text style={styles.accessDeniedText}>
            No tienes los permisos necesarios para esta función.
          </Text>
          <Text style={styles.accessDeniedSubtext}>
            Permisos requeridos: {requiredPermissions.join(', ')}
          </Text>
        </View>
      );
    }
  }

  // Si todas las validaciones pasan, mostrar contenido
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1128',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1128',
    padding: 20,
  },
  accessDeniedTitle: {
    color: '#ff6b6b',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  accessDeniedText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  accessDeniedSubtext: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ProtectedRoute;