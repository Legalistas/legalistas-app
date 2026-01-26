import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import { typography } from "../styles/typography";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/ApiService";
import { getStageColors, getStageIconName, getStageName, getProgressFromStage } from "../utils/caseStages";
import { getRelativeTime } from "../utils/formatters";
import { getServiceName } from "../utils/serviceTypes";

interface CasesScreenProps {
  onNavigateToDetail?: (caseId: string | number) => void;
}

const CasesScreen = ({ onNavigateToDetail }: CasesScreenProps = {}) => {
  const navigation = useNavigation();
  const { userInfo } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const ITEMS_PER_PAGE = 10;

  const filters = [
    { key: 'all', label: 'Todos' },
    { key: 'inProgress', label: 'En Proceso' },
    { key: 'finished', label: 'Finalizados' },
    { key: 'pending', label: 'Pendientes' },
  ];

  const handleCasePress = (caseId: string | number) => {
    if (onNavigateToDetail) {
      onNavigateToDetail(caseId);
    } else {
      (navigation as any).navigate('CaseDetail', { caseId });
    }
  };

  const fetchCases = async (pageNum: number, isRefresh = false) => {
    if (!userInfo?.id) return;

    if (isRefresh) {
      setRefreshing(true);
    } else if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const res = await ApiService.getCases(userInfo.id, pageNum, ITEMS_PER_PAGE);

      let newCases: any[] = [];
      let totalItems = 0;

      if (res.success && res.data?.data && Array.isArray(res.data.data)) {
        newCases = res.data.data;
        totalItems = res.data.total || res.data.data.length;
      } else if (res.success && Array.isArray(res.data)) {
        newCases = res.data;
        totalItems = res.data.length;
      } else if (res.success && res.data?.results) {
        newCases = res.data.results;
        totalItems = res.data.total || res.data.results.length;
      } else {
        setError(res.error || res.message || "No se pudieron cargar los casos");
        return;
      }

      if (pageNum === 1 || isRefresh) {
        setCases(newCases);
      } else {
        setCases(prev => [...prev, ...newCases]);
      }

      // Verificar si hay más páginas
      const totalLoaded = pageNum === 1 ? newCases.length : cases.length + newCases.length;
      setHasMore(newCases.length === ITEMS_PER_PAGE && totalLoaded < totalItems);

    } catch (e: any) {
      setError(e.message || "Error de red");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCases(1);
  }, [userInfo?.id]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    fetchCases(1, true);
  }, [userInfo?.id]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCases(nextPage);
    }
  };

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: any) => {
    const paddingToBottom = 100;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  // Filtrar casos según el filtro activo
  const getFilteredCases = () => {
    if (activeFilter === 'all') return cases;
    
    return cases.filter((item) => {
      const stageId = item.stageId;
      switch (activeFilter) {
        case 'inProgress':
          return stageId === 2; // Caso En Trámite
        case 'finished':
          return stageId === 3 || stageId === 4 || stageId === 6; // Cierre Logrado, Cobrado, Cerrado
        case 'pending':
          return stageId === 1; // Documentación Pendiente
        default:
          return true;
      }
    });
  };

  const filteredCases = getFilteredCases();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mis Casos</Text>
          <Text style={styles.headerSubtitle}>
            {filteredCases.length} {filteredCases.length === 1 ? 'caso' : 'casos'} {activeFilter !== 'all' ? 'filtrados' : 'registrados'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.main}
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#09A4B5']}
            tintColor="#09A4B5"
          />
        }
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Filtros rápidos */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                activeFilter === filter.key && styles.filterChipActive
              ]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text style={[
                styles.filterChipText,
                activeFilter === filter.key && styles.filterChipTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Loading inicial */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#09A4B5" />
            <Text style={styles.loadingText}>Cargando casos...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={48} color="#e11d48" />
            <Text style={styles.errorTitle}>Error al cargar</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : cases.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Sin casos</Text>
            <Text style={styles.emptyText}>No tienes casos registrados aún</Text>
          </View>
        ) : filteredCases.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="filter-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptyText}>No hay casos con este filtro</Text>
            <TouchableOpacity 
              style={styles.clearFilterButton} 
              onPress={() => setActiveFilter('all')}
            >
              <Text style={styles.clearFilterButtonText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {filteredCases.map((item, idx) => {
              const stageColors = getStageColors(item.stageId);
              const stageIcon = getStageIconName(item.stageId);
              const stageName = getStageName(item.stageId);
              const progress = item.progress || getProgressFromStage(item.stageId);
              const serviceName = getServiceName(item.servicesId);

              return (
                <TouchableOpacity
                  key={item.id || idx}
                  style={styles.caseCard}
                  onPress={() => handleCasePress(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.caseHeader}>
                    <View style={styles.caseHeaderLeft}>
                      <View style={[styles.caseBadge, { backgroundColor: stageColors.background, borderColor: stageColors.border }]}>
                        <Ionicons name={stageIcon as any} size={12} color={stageColors.text} style={{ marginRight: 4 }} />
                        <Text style={[styles.caseBadgeText, { color: stageColors.text }]}>
                          {item.id || item.numero || 'SIN CÓDIGO'} • {serviceName}
                        </Text>
                      </View>
                      <Text style={styles.caseTitle} numberOfLines={2}>
                        {item.title || item.titulo || 'Sin título'}
                      </Text>
                      <Text style={[styles.stageName, { color: stageColors.text }]}>{stageName}</Text>
                    </View>
                    <TouchableOpacity style={styles.moreButton}>
                      <Ionicons name="ellipsis-vertical" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: stageColors.text }]} />
                    </View>
                    <Text style={styles.progressText}>{progress}%</Text>
                  </View>

                  <View style={styles.caseFooter}>
                    <View style={styles.avatarGroup}>
                      {item.responsibleLawyer?.image ? (
                        <Image
                          source={{ uri: `https://backend.legalistas.ar${item.responsibleLawyer.image}` }}
                          style={styles.avatar}
                        />
                      ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                          <Ionicons name="person" size={16} color="#94a3b8" />
                        </View>
                      )}
                      <Text style={styles.responsibleName} numberOfLines={1}>
                        {item.responsibleLawyer?.name || 'Sin asignar'}
                      </Text>
                    </View>
                    <Text style={styles.lastUpdate}>
                      {getRelativeTime(item.updatedAt || item.createdAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Loading more indicator */}
            {loadingMore && (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#09A4B5" />
                <Text style={styles.loadingMoreText}>Cargando más...</Text>
              </View>
            )}

            {/* No more items */}
            {!hasMore && cases.length > 0 && (
              <View style={styles.endList}>
                <Text style={styles.endListText}>Has visto todos tus casos</Text>
              </View>
            )}
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1C2434',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    gap: 4,
  },
  headerTitle: {
    ...typography.h2,
    color: '#fff',
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: '#94a3b8',
  },
  main: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mainContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  filtersContainer: {
    marginBottom: 16,
    marginHorizontal: -16,
    maxHeight: 44,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
    height: 36,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#09A4B5',
    borderColor: '#09A4B5',
  },
  filterChipText: {
    ...typography.labelSmall,
    color: '#64748b',
    lineHeight: 16,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    ...typography.body,
    color: '#64748b',
    marginTop: 12,
  },
  errorBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 16,
    padding: 32,
    marginVertical: 16,
  },
  errorTitle: {
    ...typography.h5,
    color: '#e11d48',
    marginTop: 12,
  },
  errorText: {
    ...typography.bodySmall,
    color: '#e11d48',
    textAlign: 'center',
    marginTop: 4,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#e11d48',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.labelSmall,
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    ...typography.h5,
    color: '#64748b',
    marginTop: 16,
  },
  emptyText: {
    ...typography.bodySmall,
    color: '#94a3b8',
    marginTop: 4,
  },
  caseCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  caseHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  caseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  caseBadgeText: {
    ...typography.captionSmall,
    fontWeight: '600',
  },
  caseTitle: {
    ...typography.h6,
    color: '#0f172a',
    marginTop: 8,
  },
  stageName: {
    ...typography.caption,
    marginTop: 4,
    fontWeight: '500',
  },
  moreButton: {
    padding: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    ...typography.caption,
    color: '#64748b',
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },
  caseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  responsibleName: {
    ...typography.caption,
    color: '#0f172a',
    flex: 1,
  },
  lastUpdate: {
    ...typography.captionSmall,
    color: '#94a3b8',
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingMoreText: {
    ...typography.bodySmall,
    color: '#64748b',
  },
  endList: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  endListText: {
    ...typography.caption,
    color: '#94a3b8',
  },
  clearFilterButton: {
    marginTop: 16,
    backgroundColor: '#09A4B5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearFilterButtonText: {
    ...typography.labelSmall,
    color: '#fff',
  },
});

export default CasesScreen;