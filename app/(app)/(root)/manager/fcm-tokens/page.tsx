'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash, ArrowDown, ArrowUp, MoreHorizontal, BadgeInfo, XCircle, Bell, BarChart3, Users, Send, Settings, Plus, Pencil, ArrowLeftRight } from 'lucide-react';
import { 
  deleteFcmToken, 
  getFcmTokens, 
  deactivateFcmToken, 
  sendFcmToToken, 
  sendFcmToTopic,
  getAvailableTopics, 
  batchSubscribeTopics, 
  AvailableTopic, 
  checkTopicSubscription,
  getAllTopicsStats,
  TopicStats,
  forceSubscribe,
  forceUnsubscribe,
  getUserTopics,
  getTopicsManagement,
  createTopic,
  updateTopic,
  deleteTopic,
  TopicManagement
} from '@/services/fcm-token-api';
import { useLoading } from '@/contexts/LoadingContext';
import { toast } from 'sonner';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { DataTable } from '@/components/DataTable';
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { FcmToken } from '@/types/fcm-token';
import { useTranslations } from 'next-intl';
import { AlertDialogUtils } from '@/components/AlertDialogUtils';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Action } from '@/types/actions';

export default function FcmTokensManagement() {
  const [tokens, setTokens] = useState<FcmToken[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const t = useTranslations('FcmTokenPage');
  const tUtils = useTranslations('Utils');
  const { navigateTo } = useLoading();
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState<FcmToken | null>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [sendTitle, setSendTitle] = useState('');
  const [sendBody, setSendBody] = useState('');
  const [sending, setSending] = useState(false);
  const [currentTokenValue, setCurrentTokenValue] = useState<string | null>(null);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<AvailableTopic[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [topicLoading, setTopicLoading] = useState(false);
  const [topicSubmitting, setTopicSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userSubscribedTopics, setUserSubscribedTopics] = useState<string[]>([]);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [topicsStats, setTopicsStats] = useState<TopicStats[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [isSendTopicModalOpen, setIsSendTopicModalOpen] = useState(false);
  const [sendTopicTitle, setSendTopicTitle] = useState('');
  const [sendTopicBody, setSendTopicBody] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [sendingTopic, setSendingTopic] = useState(false);
  
  // Topic Management States
  const [isTopicManagementOpen, setIsTopicManagementOpen] = useState(false);
  const [allTopics, setAllTopics] = useState<TopicManagement[]>([]);
  const [topicManagementLoading, setTopicManagementLoading] = useState(false);
  const [isTopicFormOpen, setIsTopicFormOpen] = useState(false);
  const [selectedTopicForEdit, setSelectedTopicForEdit] = useState<TopicManagement | null>(null);
  const [topicFormData, setTopicFormData] = useState<Partial<TopicManagement>>({
    topicId: '',
    name: '',
    description: '',
    icon: '',
    category: '',
    isActive: true,
  });
  const [isTopicDeleteOpen, setIsTopicDeleteOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<TopicManagement | null>(null);

  const fetchTokens = async (page: number, size: number, search: string) => {
    setLoading(true);
    try {
      const response = await getFcmTokens({ page: page + 1, size, search });
      setTokens(response.data || []);
      setPageCount(response.totalPages || 0);
    } catch (error) {
      toast.error(t('messages.loadError'));
      setTokens([]);
      setPageCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens(pageIndex, pageSize, search);
  }, [pageIndex, pageSize, search]);

  useEffect(() => {
    // Load available topics khi component mount để dùng cho các modal
    const loadTopics = async () => {
      try {
        const topics = await getAvailableTopics();
        setAvailableTopics(topics);
      } catch (_error) {
        console.error('Failed to load available topics');
      }
    };
    loadTopics();
  }, []);

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
  }

  const handleOpenDeleteDialog = (token: FcmToken) => {
    setToken(token);
    setIsOpen(true);
  }

  const handleOpenSendModal = (tokenValue: string) => {
    setCurrentTokenValue(tokenValue);
    setSendTitle('');
    setSendBody('');
    setIsSendModalOpen(true);
  };

  const handleToggleTopic = (topicId: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const handleOpenTopicModal = async (userId: number) => {
    setCurrentUserId(userId);
    setIsTopicModalOpen(true);
    setTopicLoading(true);
    try {
      const topics = await getAvailableTopics();
      setAvailableTopics(topics);
      // Load subscribed topics của user này
      // Vì getUserTopics() dùng user hiện tại, ta tạm không load chính xác
      // Admin chỉ force subscribe thêm topic chứ không xem trạng thái cụ thể
      setUserSubscribedTopics([]);
      setSelectedTopicIds([]);
    } catch (_error) {
      toast.error(t('messages.loadTopicsError'));
    } finally {
      setTopicLoading(false);
    }
  };

  const handleSubmitTopics = async () => {
    if (!currentUserId) return;
    if (selectedTopicIds.length === 0) {
      toast.error(t('messages.selectTopicError'));
      return;
    }
    try {
      setTopicSubmitting(true);
      // Force subscribe các topics được chọn
      for (const topicId of selectedTopicIds) {
        await forceSubscribe(currentUserId, topicId);
      }
      toast.success(t('messages.subscribeTopicsSuccess'));
      setIsTopicModalOpen(false);
    } catch (_error) {
      toast.error(t('messages.subscribeTopicsError'));
    } finally {
      setTopicSubmitting(false);
    }
  };

  const handleUnsubscribeTopic = async (topicId: string) => {
    if (!currentUserId) return;
    try {
      await forceUnsubscribe(currentUserId, topicId);
      setUserSubscribedTopics(prev => prev.filter(t => t !== topicId));
      toast.success(t('messages.unsubscribeSuccess'));
    } catch (_error) {
      toast.error(t('messages.unsubscribeError'));
    }
  };

  const handleOpenStatsModal = async () => {
    setIsStatsModalOpen(true);
    setStatsLoading(true);
    try {
      const stats = await getAllTopicsStats();
      setTopicsStats(stats);
    } catch (_error) {
      toast.error(t('messages.loadStatsError'));
    } finally {
      setStatsLoading(false);
    }
  };

  const handleOpenSendTopicModal = () => {
    setIsSendTopicModalOpen(true);
    setSendTopicTitle('');
    setSendTopicBody('');
    setSelectedTopic('');
  };

  const handleSendToTopic = async () => {
    if (!selectedTopic || !sendTopicTitle || !sendTopicBody) {
      toast.error(t('messages.sendValidationError'));
      return;
    }
    try {
      setSendingTopic(true);
      await sendFcmToTopic(selectedTopic, {
        title: sendTopicTitle,
        body: sendTopicBody,
      });
      toast.success(t('messages.sendTopicSuccess'));
      setIsSendTopicModalOpen(false);
    } catch (_error) {
      toast.error(t('messages.sendTopicError'));
    } finally {
      setSendingTopic(false);
    }
  };

  // Topic Management Handlers
  const handleOpenTopicManagement = async () => {
    setIsTopicManagementOpen(true);
    setTopicManagementLoading(true);
    try {
      const topics = await getTopicsManagement();
      setAllTopics(topics);
    } catch (_error) {
      toast.error(t('messages.loadTopicsManagementError'));
    } finally {
      setTopicManagementLoading(false);
    }
  };

  const handleOpenTopicForm = (topic?: TopicManagement) => {
    if (topic) {
      setSelectedTopicForEdit(topic);
      setTopicFormData({
        topicId: topic.topicId,
        name: topic.name,
        description: topic.description,
        icon: topic.icon,
        category: topic.category,
        isActive: topic.isActive,
      });
    } else {
      setSelectedTopicForEdit(null);
      setTopicFormData({
        topicId: '',
        name: '',
        description: '',
        icon: '',
        category: '',
        isActive: true,
      });
    }
    setIsTopicFormOpen(true);
  };

  const handleSubmitTopic = async () => {
    if (!topicFormData.topicId || !topicFormData.name || !topicFormData.category) {
      toast.error(t('messages.topicValidationError'));
      return;
    }

    try {
      if (selectedTopicForEdit?.id) {
        await updateTopic(selectedTopicForEdit.id, topicFormData);
        toast.success(t('messages.updateTopicSuccess'));
      } else {
        await createTopic(topicFormData as Omit<TopicManagement, 'id' | 'createdAt' | 'updatedAt'>);
        toast.success(t('messages.createTopicSuccess'));
      }
      setIsTopicFormOpen(false);
      // Reload topics
      const topics = await getTopicsManagement();
      setAllTopics(topics);
      // Reload available topics for other modals
      const availTopics = await getAvailableTopics();
      setAvailableTopics(availTopics);
    } catch (_error) {
      toast.error(selectedTopicForEdit ? t('messages.updateTopicError') : t('messages.createTopicError'));
    }
  };

  const handleOpenDeleteTopic = (topic: TopicManagement) => {
    setTopicToDelete(topic);
    setIsTopicDeleteOpen(true);
  };

  const handleDeleteTopic = async () => {
    if (!topicToDelete?.id) return;
    try {
      await deleteTopic(topicToDelete.id);
      toast.success(t('messages.deleteTopicSuccess'));
      setIsTopicDeleteOpen(false);
      // Reload topics
      const topics = await getTopicsManagement();
      setAllTopics(topics);
      const availTopics = await getAvailableTopics();
      setAvailableTopics(availTopics);
    } catch (_error) {
      toast.error(t('messages.deleteTopicError'));
    }
  };

  const handleToggleTopicActive = async (topic: TopicManagement) => {
    if (!topic.id) return;
    try {
      await updateTopic(topic.id, { isActive: !topic.isActive });
      toast.success(t('messages.toggleTopicSuccess'));
      // Reload topics
      const topics = await getTopicsManagement();
      setAllTopics(topics);
      const availTopics = await getAvailableTopics();
      setAvailableTopics(availTopics);
    } catch (_error) {
      toast.error(t('messages.toggleTopicError'));
    }
  };

  const handleSendTestNotification = async () => {
    if (!currentTokenValue) return;
    if (!sendTitle || !sendBody) {
      toast.error(t('messages.sendValidationError'));
      return;
    }
    try {
      setSending(true);
      await sendFcmToToken(currentTokenValue, {
        title: sendTitle,
        body: sendBody,
      });
      toast.success(t('messages.sendSuccess'));
      setIsSendModalOpen(false);
    } catch (_error) {
      toast.error(t('messages.sendError'));
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (tokenId: string | undefined) => {
    if (!tokenId) return;
    try {
      await deleteFcmToken(tokenId);
      setTokens(tokens.filter(t => t.id !== tokenId));
      fetchTokens(pageIndex, pageSize, search);
      toast.success(t('messages.deleteSuccess'));
    } catch (_error) {
      toast.error(t('messages.deleteError'));
    }
  };

  const handleDeactivate = async (tokenId: string | undefined) => {
    if (!tokenId) return;
    try {
      await deactivateFcmToken(tokenId);
      fetchTokens(pageIndex, pageSize, search);
      toast.success(t('messages.deactivateSuccess'));
    } catch (_error) {
      toast.error(t('messages.deactivateError'));
    }
  };

  const columns: ColumnDef<FcmToken>[] = [
    {
      id: "select",
      accessorKey: "id",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={tUtils('selectAll')}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={tUtils('selectAll')}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "token",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t('token')}
            {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
          </Button>
        )
      },
      cell: ({ row }) => {
        const token = row.getValue("token") as string
        return (
          <div className="text-sm text-gray-500 max-w-xs truncate font-mono">
            {token}
          </div>
        )
      }
    },
    {
      accessorKey: "platform",
      header: t('platform'),
      cell: ({ row }) => {
        const platform = row.getValue("platform") as string
        return (
          <div className="text-sm text-gray-500">
            {platform ? t(`platforms.${platform}`) : tUtils('unknown')}
          </div>
        )
      },
    },
    {
      accessorKey: "deviceId",
      header: t('deviceId'),
      cell: ({ row }) => {
        const deviceId = row.getValue("deviceId") as string
        return (
          <div className="text-sm text-gray-500 max-w-xs truncate">
            {deviceId || 'N/A'}
          </div>
        )
      }
    },
    {
      accessorKey: "userId",
      header: t('userId'),
      cell: ({ row }) => {
        const userId = row.getValue("userId") as number
        return (
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span>{userId || 'N/A'}</span>
            {userId && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => handleOpenTopicModal(userId)}
              >
                {t('manageSubscriptions')}
              </Button>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "isActive",
      header: t('isActive'),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        return (
          <div className="text-sm">
            <span className={`px-2 py-1 rounded-full text-xs ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isActive ? tUtils('active') : tUtils('inactive')}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: t('createdAt'),
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string
        return (
          <div className="text-sm text-gray-500">
            {createdAt ? new Date(createdAt).toLocaleDateString('vi-VN') : 'N/A'}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: t('actions'),
      cell: ({ row }) => {
        const token = row.original
        return (
          <div className="p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{tUtils('openMenu')}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className='bg-white shadow-sm rounded-xs'>
                <DropdownMenuItem className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300"
                  onClick={() => navigateTo(`/manager/fcm-tokens/details/${token.id}`)}>
                  <BadgeInfo className="mr-2 h-4 w-4 text-gray-500" />
                  {t('viewDetails')}
                </DropdownMenuItem>
                {token.isActive && (
                  <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-yellow-300 text-yellow-600'
                    onClick={() => handleDeactivate(token.id)}
                  >
                    <XCircle className="mr-2 h-4 w-4 text-yellow-600" />
                    {t('deactivate')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="flex flex-start px-4 py-2 cursor-pointer hover:bg-blue-300 text-blue-600"
                  onClick={() => handleOpenSendModal(token.token)}
                >
                  <Bell className="mr-2 h-4 w-4 text-blue-600" />
                  {t('sendTestNotification')}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-red-300" 
                  onClick={() => handleOpenDeleteDialog(token)}>
                  <Trash className="mr-2 h-4 w-4 text-red-600" />
                  {tUtils('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const lstActions: Action[] = [
    {
      icon: <Settings className="w-4 h-4 mr-2" />,
      onClick: handleOpenTopicManagement,
      title: t('manageTopics'),
      className: "hover:bg-orange-100 rounded-md transition-colors text-orange-600",
    },
    {
      icon: <BarChart3 className="w-4 h-4 mr-2" />,
      onClick: handleOpenStatsModal,
      title: t('viewTopicStats'),
      className: "hover:bg-green-100 rounded-md transition-colors text-green-600",
    },
    {
      icon: <Send className="w-4 h-4 mr-2" />,
      onClick: handleOpenSendTopicModal,
      title: t('sendToTopic'),
      className: "hover:bg-purple-100 rounded-md transition-colors text-purple-600",
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle={t('title')} />
      <div className="space-y-6">
        <ComponentCard title={t('title')} listAction={lstActions}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-gray-500">{tUtils('loading')}</span>
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={tokens}
              pageCount={pageCount}
              onPaginationChange={handlePaginationChange}
              onSearchChange={handleSearch}
              manualPagination={true}
            />
          )}
        </ComponentCard>
        <AlertDialogUtils 
          title={t('messages.deleteTitle')}
          content={t('messages.deleteDescription')}
          confirmText={tUtils('confirm')}
          cancelText={tUtils('cancel')}
          onConfirm={() => handleDelete(token?.id)}
          isOpen={isOpen}
          onCancel={() => setIsOpen(false)}
        />
        <Modal
          isOpen={isSendModalOpen}
          onClose={() => setIsSendModalOpen(false)}
          className="p-6 max-w-lg w-full"
          modalSize="md"
        >
          <h3 className="text-lg font-semibold mb-4">{t('sendTestNotification')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('notificationTitle')}</label>
              <Input
                value={sendTitle}
                onChange={(e) => setSendTitle(e.target.value)}
                placeholder={t('notificationTitle')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('notificationBody')}</label>
              <Textarea
                value={sendBody}
                onChange={(e) => setSendBody(e.target.value)}
                placeholder={t('notificationBody')}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsSendModalOpen(false)}>
                {tUtils('cancel')}
              </Button>
              <Button onClick={handleSendTestNotification} disabled={sending}>
                {sending ? tUtils('loading') : tUtils('confirm')}
              </Button>
            </div>
          </div>
        </Modal>
        <Modal
          isOpen={isTopicModalOpen}
          onClose={() => setIsTopicModalOpen(false)}
          className="p-6 max-w-xl w-full"
          modalSize="md"
        >
          <h3 className="text-lg font-semibold mb-4">{t('manageSubscriptions')}</h3>
          {topicLoading ? (
            <div className="flex items-center justify-center py-6">
              <span className="text-gray-500">{tUtils('loading')}</span>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                {t('manageSubscriptionsDescription')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                {availableTopics.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleToggleTopic(topic.id)}
                    className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-left transition ${
                      selectedTopicIds.includes(topic.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-xl">{topic.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{topic.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {topic.description}
                      </p>
                    </div>
                  </button>
                ))}
                {availableTopics.length === 0 && (
                  <span className="text-sm text-gray-500">
                    {t('noTopics')}
                  </span>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsTopicModalOpen(false)}
                >
                  {tUtils('cancel')}
                </Button>
                <Button
                  onClick={handleSubmitTopics}
                  disabled={topicSubmitting || selectedTopicIds.length === 0}
                >
                  {topicSubmitting ? tUtils('loading') : t('applySubscriptions')}
                </Button>
              </div>
            </div>
          )}
        </Modal>
        <Modal
          isOpen={isStatsModalOpen}
          onClose={() => setIsStatsModalOpen(false)}
          className="p-6 max-w-2xl w-full"
          modalSize="lg"
        >
          <h3 className="text-lg font-semibold mb-4">{t('topicStatistics')}</h3>
          {statsLoading ? (
            <div className="flex items-center justify-center py-6">
              <span className="text-gray-500">{tUtils('loading')}</span>
            </div>
          ) : (
            <div className="space-y-3">
              {topicsStats.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  {t('noStats')}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('topicName')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('subscriberCount')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('activeTokenCount')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {topicsStats.map((stat) => (
                        <tr key={stat.topic}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {availableTopics.find(t => t.id === stat.topic)?.name || stat.topic}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {stat.subscriberCount || 0}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {stat.activeTokenCount || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setIsStatsModalOpen(false)}>
                  {tUtils('close')}
                </Button>
              </div>
            </div>
          )}
        </Modal>
        <Modal
          isOpen={isSendTopicModalOpen}
          onClose={() => setIsSendTopicModalOpen(false)}
          className="p-6 max-w-lg w-full"
          modalSize="md"
        >
          <h3 className="text-lg font-semibold mb-4">{t('sendToTopic')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('selectTopic')}</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('selectTopicPlaceholder')}</option>
                {availableTopics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.icon} {topic.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('notificationTitle')}</label>
              <Input
                value={sendTopicTitle}
                onChange={(e) => setSendTopicTitle(e.target.value)}
                placeholder={t('notificationTitle')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('notificationBody')}</label>
              <Textarea
                value={sendTopicBody}
                onChange={(e) => setSendTopicBody(e.target.value)}
                placeholder={t('notificationBody')}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsSendTopicModalOpen(false)}>
                {tUtils('cancel')}
              </Button>
              <Button onClick={handleSendToTopic} disabled={sendingTopic}>
                {sendingTopic ? tUtils('loading') : tUtils('send')}
              </Button>
            </div>
          </div>
        </Modal>
        
        {/* Topic Management Modal */}
        <Modal
          isOpen={isTopicManagementOpen}
          onClose={() => setIsTopicManagementOpen(false)}
          className="p-6 max-w-6xl w-full"
          modalSize="2xl"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{t('topicManagement')}</h3>
            <Button onClick={() => handleOpenTopicForm()}>
              <Plus className="w-4 h-4 mr-2" />
              {t('addTopic')}
            </Button>
          </div>
          
          {topicManagementLoading ? (
            <div className="flex items-center justify-center py-6">
              <span className="text-gray-500">{tUtils('loading')}</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('icon')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('topicId')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('topicName')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('topicDescription')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('category')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('status')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allTopics.map((topic) => (
                    <tr key={topic.id}>
                      <td className="px-4 py-3 text-2xl">{topic.icon}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-700">{topic.topicId}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{topic.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{topic.description}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {topic.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${topic.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {topic.isActive ? tUtils('active') : tUtils('inactive')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenTopicForm(topic)}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleTopicActive(topic)}
                          >
                            <ArrowLeftRight className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDeleteTopic(topic)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {allTopics.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                        {t('noTopics')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="flex justify-end pt-4 mt-4 border-t">
            <Button variant="outline" onClick={() => setIsTopicManagementOpen(false)}>
              {tUtils('close')}
            </Button>
          </div>
        </Modal>

        {/* Topic Form Modal */}
        <Modal
          isOpen={isTopicFormOpen}
          onClose={() => setIsTopicFormOpen(false)}
          className="p-6 max-w-2xl w-full"
          modalSize="lg"
        >
          <h3 className="text-lg font-semibold mb-4">
            {selectedTopicForEdit ? t('editTopic') : t('createTopic')}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('topicId')} <span className="text-red-500">*</span>
                </label>
                <Input
                  value={topicFormData.topicId}
                  onChange={(e) => setTopicFormData({ ...topicFormData, topicId: e.target.value })}
                  placeholder="topic-example"
                  disabled={!!selectedTopicForEdit}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('topicName')} <span className="text-red-500">*</span>
                </label>
                <Input
                  value={topicFormData.name}
                  onChange={(e) => setTopicFormData({ ...topicFormData, name: e.target.value })}
                  placeholder={t('topicNamePlaceholder')}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('topicDescription')}</label>
              <Textarea
                value={topicFormData.description}
                onChange={(e) => setTopicFormData({ ...topicFormData, description: e.target.value })}
                placeholder={t('topicDescriptionPlaceholder')}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('icon')}</label>
                <Input
                  value={topicFormData.icon}
                  onChange={(e) => setTopicFormData({ ...topicFormData, icon: e.target.value })}
                  placeholder="📝"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('category')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={topicFormData.category}
                  onChange={(e) => setTopicFormData({ ...topicFormData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('selectCategory')}</option>
                  <option value="content">Content</option>
                  <option value="news">News</option>
                  <option value="system">System</option>
                  <option value="marketing">Marketing</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={topicFormData.isActive}
                onCheckedChange={(checked) => setTopicFormData({ ...topicFormData, isActive: !!checked })}
              />
              <label className="text-sm font-medium">{t('isActive')}</label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsTopicFormOpen(false)}>
                {tUtils('cancel')}
              </Button>
              <Button onClick={handleSubmitTopic}>
                {selectedTopicForEdit ? tUtils('update') : tUtils('create')}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Topic Delete Confirmation */}
        <AlertDialogUtils 
          title={t('messages.deleteTopicTitle')}
          content={t('messages.deleteTopicDescription')}
          confirmText={tUtils('confirm')}
          cancelText={tUtils('cancel')}
          onConfirm={handleDeleteTopic}
          isOpen={isTopicDeleteOpen}
          onCancel={() => setIsTopicDeleteOpen(false)}
        />
      </div>
    </div>
  );
}

