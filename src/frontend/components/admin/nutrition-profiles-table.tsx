'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Loader2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NutritionProfileForm } from '@/components/admin/nutrition-profile-form';
import { NutritionRecommendationsForm } from '@/components/admin/nutrition-recommendations-form';

interface NutritionProfile {
  id: string;
  stt: number;
  age_group?: string;
  gender?: string;
  labor_level?: string;
  physiological_condition?: string;
  created_at?: string;
}

interface NutritionRecommendation {
  id: string;
  profile_stt: number;
  nutrient_name: string;
  unit?: string;
  value_str: string;
  created_at?: string;
}

interface NutritionProfilesTableProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function NutritionProfilesTable({ title, description, icon }: NutritionProfilesTableProps) {
  const [profiles, setProfiles] = useState<NutritionProfile[]>([]);
  const [recommendations, setRecommendations] = useState<Record<number, NutritionRecommendation[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedProfile, setExpandedProfile] = useState<number | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<NutritionProfile | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<number | null>(null);
  const [showRecommendationsForm, setShowRecommendationsForm] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 20;

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;

      const res = await adminApi.getNutritionProfiles({
        limit,
        offset,
        condition: activeSearch
      });

      setProfiles(res.profiles || []);
      setTotalItems(res.total || 0);
    } catch (error) {
      console.error('Failed to fetch nutrition profiles:', error);
    } finally {
      setLoading(false);
    }
  }, [page, activeSearch, limit]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const fetchRecommendations = useCallback(async (profileStt: number) => {
    try {
      const res = await adminApi.getNutritionRecommendations(profileStt);
      setRecommendations(prev => ({
        ...prev,
        [profileStt]: res.recommendations || []
      }));
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  }, []);

  const toggleExpanded = (stt: number) => {
    if (expandedProfile === stt) {
      setExpandedProfile(null);
    } else {
      setExpandedProfile(stt);
      // Always fetch recommendations to get the latest data
      fetchRecommendations(stt);
    }
  };

  const confirmDeleteProfile = async () => {
    if (profileToDelete === null) return;

    try {
      await adminApi.deleteNutritionProfile(profileToDelete);
      setProfileToDelete(null);
      // Remove recommendations for this profile from state
      const newRecommendations = { ...recommendations };
      delete newRecommendations[profileToDelete];
      setRecommendations(newRecommendations);
      fetchProfiles();
    } catch (error) {
      console.error('Failed to delete profile:', error);
    }
  };

  const confirmDeleteRecommendation = async (recId: string, profileStt: number) => {
    try {
      await adminApi.deleteNutritionRecommendation(recId);
      fetchRecommendations(profileStt);
    } catch (error) {
      console.error('Failed to delete recommendation:', error);
    }
  };

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return (
    <div className="space-y-6">
      <Dialog open={showProfileForm && !selectedProfile} onOpenChange={(open) => !open && setShowProfileForm(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-white dark:bg-gray-950 shadow-2xl">
          <NutritionProfileForm
            onSuccess={() => {
              setShowProfileForm(false);
              fetchProfiles();
            }}
            onCancel={() => setShowProfileForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedProfile} onOpenChange={(open) => !open && setSelectedProfile(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-white dark:bg-gray-950 shadow-2xl">
          {selectedProfile && (
            <NutritionProfileForm
              initialData={selectedProfile}
              onSuccess={() => {
                setSelectedProfile(null);
                fetchProfiles();
              }}
              onCancel={() => setSelectedProfile(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRecommendationsForm} onOpenChange={(open) => !open && setShowRecommendationsForm(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-white dark:bg-gray-950 shadow-2xl">
          {expandedProfile !== null && (
            <NutritionRecommendationsForm
              profileStt={expandedProfile}
              onSuccess={() => {
                setShowRecommendationsForm(false);
                fetchRecommendations(expandedProfile);
              }}
              onCancel={() => setShowRecommendationsForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={profileToDelete !== null} onOpenChange={(open) => !open && setProfileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa profile và tất cả các khuyến cáo liên quan. Không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProfile} className="bg-destructive hover:bg-destructive/90">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-50 dark:bg-rose-950/30 rounded-lg text-rose-500">
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-gray-500 text-sm">{description}</p>
          </div>
        </div>
        <Button onClick={() => setShowProfileForm(true)} className="gap-2 bg-rose-500 hover:bg-rose-600 shrink-0">
          <Plus className="h-4 w-4" />
          Thêm Profile
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo điều kiện..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
          />
        </div>
      </div>

      <Card className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b bg-gray-50/50 dark:bg-gray-900/50">
                  <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">STT</th>
                  <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Độ tuổi</th>
                  <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Giới tính</th>
                  <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Mức lao động</th>
                  <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Tình trạng</th>
                  <th className="py-3 px-4 font-semibold text-center text-gray-700 dark:text-gray-300">Sửa/Xóa</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-rose-500" />
                    </td>
                  </tr>
                ) : profiles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      Không có dữ liệu nutrition profile.
                    </td>
                  </tr>
                ) : (
                  <>
                    {profiles.map((profile) => (
                      <React.Fragment key={profile.stt}>
                        <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer" onClick={() => toggleExpanded(profile.stt)}>
                          <td className="py-3 px-4 text-gray-500">#{profile.stt}</td>
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{profile.age_group || '---'}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="border-gray-300">{profile.gender || '---'}</Badge>
                          </td>
                          <td className="py-3 px-4">{profile.labor_level || '---'}</td>
                          <td className="py-3 px-4 text-sm">{profile.physiological_condition || '---'}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProfile(profile);
                                }}
                                className="h-8 w-8 text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProfileToDelete(profile.stt);
                                }}
                                className="h-8 w-8 text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {expandedProfile === profile.stt && (
                          <tr className="border-b bg-gray-50/50 dark:bg-gray-900/25">
                            <td colSpan={6} className="py-4 px-4">
                              <RecommendationsSection
                                profileStt={profile.stt}
                                recommendations={recommendations[profile.stt] || []}
                                onAddRecommendation={() => {
                                  setShowRecommendationsForm(true);
                                }}
                                onDeleteRecommendation={confirmDeleteRecommendation}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Hiển thị {(page - 1) * limit + 1}-{Math.min(page * limit, totalItems)} / {totalItems} profile
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">Trang {page} / {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface RecommendationsSectionProps {
  profileStt: number;
  recommendations: NutritionRecommendation[];
  onAddRecommendation: () => void;
  onDeleteRecommendation: (recId: string, profileStt: number) => void;
}

function RecommendationsSection({ profileStt, recommendations, onAddRecommendation, onDeleteRecommendation }: RecommendationsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Khuyến cáo dinh dưỡng</h3>
        <Button size="sm" onClick={onAddRecommendation} className="bg-rose-500 hover:bg-rose-600 gap-2">
          <Plus className="h-4 w-4" />
          Thêm khuyến cáo
        </Button>
      </div>

      {recommendations.length === 0 ? (
        <p className="text-sm text-gray-500">Chưa có khuyến cáo nào cho profile này.</p>
      ) : (
        <div className="space-y-2">
          {recommendations.map((rec) => (
            <div key={rec.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{rec.nutrient_name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {rec.value_str} {rec.unit || ''}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteRecommendation(rec.id, profileStt)}
                className="h-8 w-8 text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
