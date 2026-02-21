'use client';

import { Notification } from '@/types/rh';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, XCircle, QrCode, Calendar, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  maxHeight?: string;
}

export function NotificationList({ notifications, onMarkAsRead, maxHeight = 'max-h-96' }: NotificationListProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (notifications.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Tidak ada notifikasi</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-semibold text-muted-foreground">
            {unreadCount} notifikasi belum dibaca
          </p>
          <button
            onClick={() => {
              if (onMarkAsRead) {
                notifications.filter(n => !n.isRead).forEach(n => onMarkAsRead(n.id));
              }
            }}
            className="text-xs text-primary hover:underline"
          >
            Tandai semua dibaca
          </button>
        </div>
      )}

      <ScrollArea className={`${maxHeight} rounded-lg border-2`}>
        <div className="p-2 space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`border-2 transition-all cursor-pointer hover:shadow-md ${
                !notification.isRead
                  ? notification.type === 'warning'
                    ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'
                    : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                  : 'bg-card'
              }`}
              onClick={() => onMarkAsRead?.(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    notification.type === 'warning'
                      ? 'bg-orange-500'
                      : 'bg-red-500'
                  }`}>
                    {notification.type === 'warning' ? (
                      <AlertTriangle className="h-5 w-5 text-white" />
                    ) : (
                      <XCircle className="h-5 w-5 text-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={notification.type === 'warning' ? 'default' : 'destructive'}
                            className={`text-xs px-2 py-0.5 ${
                              notification.type === 'warning'
                                ? 'bg-orange-500 hover:bg-orange-600'
                                : ''
                            }`}
                          >
                            {notification.type === 'warning' ? 'Wajib Retur' : 'Jatuh RH'}
                          </Badge>
                          {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                          )}
                        </div>
                        <h4 className="font-semibold text-sm sm:text-base text-foreground truncate">
                          {notification.productName}
                        </h4>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                        <QrCode className="h-3 w-3" />
                        <span className="font-mono font-medium">{notification.barcode}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                        <span className="font-mono font-medium">{notification.batchNumber}</span>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex flex-wrap gap-3 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Tgl Kadaluarsa: <span className="font-medium text-foreground">
                          {format(new Date(notification.expiryDate), 'dd MMM yyyy', { locale: id })}
                        </span></span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Tgl RH: <span className={`font-medium ${
                          notification.type === 'warning' ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {format(new Date(notification.rhDate), 'dd MMM yyyy', { locale: id })}
                        </span></span>
                      </div>
                    </div>

                    {/* Message */}
                    <p className="text-xs text-muted-foreground">
                      {notification.message}
                    </p>

                    {/* Timestamp */}
                    <p className="text-[10px] text-muted-foreground">
                      {format(new Date(notification.createdAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
