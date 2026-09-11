"use client";

import { useState, useTransition, useMemo } from "react";
import {
  CalendarDays,
  Plus,
  Search,
  AlertCircle,
  Clock,
  Car,
  DoorOpen,
  Users,
  ShieldCheck,
  Eye,
  Ban,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import {
  LiyonCard,
  DataTable,
  StatusPill,
  LiyonSelect,
  RowMenuItem,
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type {
  ResourceItemDto,
  ResourceReservationDto,
} from "@/features/reservation";
import {
  cancelReservationAction,
  toggleResourceActiveAction,
  getMyReservationsAction,
  getReservationsAction,
  getResourcesAction,
} from "@/features/reservation/actions";
import { RoomGrid } from "./room-grid";
import { VehicleGrid } from "./vehicle-grid";
import { BookingDialog } from "./booking-dialog";
import { ReviewDialog } from "./review-dialog";
import { ResourceDialog } from "./resource-dialog";
import { ReservationDetailDialog } from "./reservation-detail-dialog";

interface DepartmentOption {
  id: string;
  nameTh: string;
  nameEn: string;
}

interface Props {
  userId: string;
  userName: string;
  initialResources: ResourceItemDto[];
  initialMyReservations: ResourceReservationDto[];
  initialAllReservations: ResourceReservationDto[];
  departments: DepartmentOption[];
  canCreate: boolean;
  canApprove: boolean;
  canManage: boolean;
}

type TabType = "rooms" | "vehicles" | "my_reservations" | "all_reservations" | "manage_resources";

export function ReservationClient({
  userId: _userId,
  initialResources,
  initialMyReservations,
  initialAllReservations,
  departments,
  canCreate,
  canApprove,
  canManage,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const [, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<TabType>("rooms");
  const [resources, setResources] = useState<ResourceItemDto[]>(initialResources);
  const [myReservations, setMyReservations] = useState<ResourceReservationDto[]>(initialMyReservations);
  const [allReservations, setAllReservations] = useState<ResourceReservationDto[]>(initialAllReservations);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Dialog States
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ResourceItemDto | null>(null);
  const [reviewingReservation, setReviewingReservation] = useState<ResourceReservationDto | null>(null);
  const [viewingReservation, setViewingReservation] = useState<ResourceReservationDto | null>(null);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);

  // Data Refresh Helpers
  const refreshData = () => {
    startTransition(async () => {
      const [resList, myRes, allRes] = await Promise.all([
        getResourcesAction(),
        getMyReservationsAction(),
        canApprove || canManage ? getReservationsAction() : Promise.resolve({ ok: true as const, data: [] }),
      ]);
      if (resList.ok) setResources(resList.data);
      if (myRes.ok) setMyReservations(myRes.data);
      if (allRes.ok) setAllReservations(allRes.data);
    });
  };

  // Open booking modal
  const handleOpenBooking = (resource?: ResourceItemDto) => {
    setSelectedResource(resource ?? null);
    setIsNewBookingOpen(true);
  };

  // Cancel Reservation
  const handleCancelReservation = (id: string) => {
    startTransition(async () => {
      const res = await cancelReservationAction({ reservationId: id });
      if (res.ok) {
        toast.success(t("reservation.notice.cancelled"));
        refreshData();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  // Toggle Resource Active
  const handleToggleResourceActive = (resourceId: string, currentActive: boolean) => {
    startTransition(async () => {
      const res = await toggleResourceActiveAction(resourceId, !currentActive);
      if (res.ok) {
        toast.success(t("reservation.notice.updated"));
        refreshData();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  // Filtered rooms and vehicles
  const roomItems = useMemo(
    () =>
      resources.filter(
        (r) =>
          r.type === "ROOM" &&
          (searchQuery
            ? r.nameTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
              r.code.toLowerCase().includes(searchQuery.toLowerCase())
            : true)
      ),
    [resources, searchQuery]
  );

  const vehicleItems = useMemo(
    () =>
      resources.filter(
        (r) =>
          r.type === "VEHICLE" &&
          (searchQuery
            ? r.nameTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
              r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (r.licensePlate && r.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()))
            : true)
      ),
    [resources, searchQuery]
  );

  const filteredMyReservations = useMemo(
    () =>
      myReservations.filter((r) => {
        if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            r.title.toLowerCase().includes(q) ||
            r.resourceNameTh.toLowerCase().includes(q) ||
            r.resourceCode.toLowerCase().includes(q)
          );
        }
        return true;
      }),
    [myReservations, statusFilter, searchQuery]
  );

  const filteredAllReservations = useMemo(
    () =>
      allReservations.filter((r) => {
        if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            r.title.toLowerCase().includes(q) ||
            r.userName.toLowerCase().includes(q) ||
            r.resourceNameTh.toLowerCase().includes(q) ||
            r.resourceCode.toLowerCase().includes(q)
          );
        }
        return true;
      }),
    [allReservations, statusFilter, searchQuery]
  );

  const getStatusTone = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "ok";
      case "PENDING":
        return "warn";
      case "REJECTED":
        return "bad";
      case "COMPLETED":
        return "info";
      default:
        return "off";
    }
  };

  // Table Columns for My Reservations
  const myColumns: DataTableColumn<ResourceReservationDto>[] = [
    {
      key: "resource",
      header: t("reservation.field.resource"),
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            {row.resourceType === "ROOM" ? (
              <DoorOpen className="h-4 w-4 text-emerald-600" />
            ) : (
              <Car className="h-4 w-4 text-sky-600" />
            )}
            <span>{locale === "en" ? row.resourceNameEn : row.resourceNameTh}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {row.resourceType === "ROOM" ? row.resourceLocation : row.licensePlate}
          </div>
        </div>
      ),
    },
    {
      key: "title",
      header: t("reservation.field.title"),
      render: (row) => (
        <div>
          <div className="font-medium text-foreground">{row.title}</div>
          {row.purpose && <div className="text-xs text-muted-foreground line-clamp-1">{row.purpose}</div>}
        </div>
      ),
    },
    {
      key: "schedule",
      header: t("reservation.field.start_time"),
      render: (row) => (
        <div className="text-xs">
          <div className="font-medium text-foreground">
            {formatDate(new Date(row.startTime), locale, { time: true })}
          </div>
          <div className="text-muted-foreground">
            ถึง {formatDate(new Date(row.endTime), locale, { time: true })}
          </div>
        </div>
      ),
    },
    {
      key: "attendees",
      header: t("reservation.field.attendees_count"),
      render: (row) => (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>{row.attendeesCount} คน</span>
        </div>
      ),
    },
    {
      key: "status",
      header: t("reservation.field.status"),
      render: (row) => {
        const key = `reservation.status.${row.status}` as const;
        return <StatusPill tone={getStatusTone(row.status)}>{t(key)}</StatusPill>;
      },
    },
  ];

  // Table Columns for All Reservations
  const allColumns: DataTableColumn<ResourceReservationDto>[] = [
    {
      key: "user",
      header: t("reservation.field.booked_by"),
      render: (row) => (
        <div>
          <div className="font-medium text-foreground">{row.userName}</div>
          <div className="text-xs text-muted-foreground">{row.departmentNameTh || row.userEmail}</div>
        </div>
      ),
    },
    {
      key: "resource",
      header: t("reservation.field.resource"),
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            {row.resourceType === "ROOM" ? (
              <DoorOpen className="h-4 w-4 text-emerald-600" />
            ) : (
              <Car className="h-4 w-4 text-sky-600" />
            )}
            <span>{locale === "en" ? row.resourceNameEn : row.resourceNameTh}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {row.resourceType === "ROOM" ? row.resourceLocation : row.licensePlate}
          </div>
        </div>
      ),
    },
    {
      key: "title",
      header: t("reservation.field.title"),
      render: (row) => (
        <div>
          <div className="font-medium text-foreground">{row.title}</div>
          {row.purpose && <div className="text-xs text-muted-foreground line-clamp-1">{row.purpose}</div>}
        </div>
      ),
    },
    {
      key: "schedule",
      header: t("reservation.field.start_time"),
      render: (row) => (
        <div className="text-xs">
          <div className="font-medium text-foreground">
            {formatDate(new Date(row.startTime), locale, { time: true })}
          </div>
          <div className="text-muted-foreground">
            ถึง {formatDate(new Date(row.endTime), locale, { time: true })}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: t("reservation.field.status"),
      render: (row) => {
        const key = `reservation.status.${row.status}` as const;
        return <StatusPill tone={getStatusTone(row.status)}>{t(key)}</StatusPill>;
      },
    },
  ];

  // Table Columns for Manage Resources
  const resourceColumns: DataTableColumn<ResourceItemDto>[] = [
    {
      key: "code",
      header: t("reservation.field.code"),
      render: (row) => <span className="font-mono text-xs font-semibold">{row.code}</span>,
    },
    {
      key: "type",
      header: t("reservation.field.resource"),
      render: (row) => {
        const typeKey = `reservation.type.${row.type}` as const;
        return (
          <div className="flex items-center gap-1.5">
            {row.type === "ROOM" ? (
              <DoorOpen className="h-4 w-4 text-emerald-600" />
            ) : (
              <Car className="h-4 w-4 text-sky-600" />
            )}
            <span>{t(typeKey)}</span>
          </div>
        );
      },
    },
    {
      key: "name",
      header: t("reservation.field.name_th"),
      render: (row) => (
        <div>
          <div className="font-medium text-foreground">{row.nameTh}</div>
          <div className="text-xs text-muted-foreground">{row.nameEn}</div>
        </div>
      ),
    },
    {
      key: "capacity",
      header: t("reservation.field.capacity"),
      render: (row) => <span>{row.capacity} คน/ที่นั่ง</span>,
    },
    {
      key: "location",
      header: t("reservation.field.location"),
      render: (row) => <span>{row.location || row.licensePlate || "—"}</span>,
    },
    {
      key: "status",
      header: t("reservation.field.status"),
      render: (row) => (
        <StatusPill tone={row.isActive ? "ok" : "off"}>
          {row.isActive ? "พร้อมใช้งาน" : "ปิดปรับปรุง"}
        </StatusPill>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("reservation.title")}
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("reservation.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCreate && (
            <Button
              onClick={() => handleOpenBooking()}
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              <span>{t("reservation.action.create")}</span>
            </Button>
          )}
          {canManage && (
            <Button
              variant="outline"
              onClick={() => setIsAddResourceOpen(true)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>{t("reservation.action.add_resource")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
        <Button
          variant={activeTab === "rooms" ? "default" : "ghost"}
          size="sm"
          onClick={() => { setActiveTab("rooms"); setSearchQuery(""); }}
          className="gap-1.5"
        >
          <DoorOpen className="h-4 w-4" />
          <span>{t("reservation.tabs.rooms")}</span>
          <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs">
            {resources.filter((r) => r.type === "ROOM").length}
          </span>
        </Button>

        <Button
          variant={activeTab === "vehicles" ? "default" : "ghost"}
          size="sm"
          onClick={() => { setActiveTab("vehicles"); setSearchQuery(""); }}
          className="gap-1.5"
        >
          <Car className="h-4 w-4" />
          <span>{t("reservation.tabs.vehicles")}</span>
          <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs">
            {resources.filter((r) => r.type === "VEHICLE").length}
          </span>
        </Button>

        <Button
          variant={activeTab === "my_reservations" ? "default" : "ghost"}
          size="sm"
          onClick={() => { setActiveTab("my_reservations"); setSearchQuery(""); }}
          className="gap-1.5"
        >
          <Clock className="h-4 w-4" />
          <span>{t("reservation.tabs.my_reservations")}</span>
          <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs">
            {myReservations.length}
          </span>
        </Button>

        {(canApprove || canManage) && (
          <Button
            variant={activeTab === "all_reservations" ? "default" : "ghost"}
            size="sm"
            onClick={() => { setActiveTab("all_reservations"); setSearchQuery(""); }}
            className="gap-1.5"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{t("reservation.tabs.all_reservations")}</span>
            <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs">
              {allReservations.filter((r) => r.status === "PENDING").length > 0 && (
                <span className="text-amber-600 font-bold mr-1">
                  {allReservations.filter((r) => r.status === "PENDING").length} รอ
                </span>
              )}
              {allReservations.length}
            </span>
          </Button>
        )}

        {canManage && (
          <Button
            variant={activeTab === "manage_resources" ? "default" : "ghost"}
            size="sm"
            onClick={() => { setActiveTab("manage_resources"); setSearchQuery(""); }}
            className="gap-1.5"
          >
            <span>{t("reservation.tabs.manage_resources")}</span>
          </Button>
        )}
      </div>

      {/* Tab Content 1: Meeting Rooms */}
      {activeTab === "rooms" && (
        <RoomGrid
          rooms={roomItems}
          canCreate={canCreate}
          onBook={handleOpenBooking}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {/* Tab Content 2: Vehicles */}
      {activeTab === "vehicles" && (
        <VehicleGrid
          vehicles={vehicleItems}
          canCreate={canCreate}
          onBook={handleOpenBooking}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {/* Tab Content 3: My Reservations */}
      {activeTab === "my_reservations" && (
        <LiyonCard>
          <DataTable
            state={filteredMyReservations.length === 0 ? "empty" : "data"}
            columns={myColumns}
            rows={filteredMyReservations}
            getRowId={(r) => r.id}
            headHeading={t("reservation.tabs.my_reservations")}
            rowMenuLabel={(r) => r.title}
            toolbar={
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t("reservation.action.filter")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <LiyonSelect
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-8 text-xs"
                >
                  <option value="ALL">ทุกสถานะ</option>
                  <option value="PENDING">{t("reservation.status.PENDING")}</option>
                  <option value="APPROVED">{t("reservation.status.APPROVED")}</option>
                  <option value="REJECTED">{t("reservation.status.REJECTED")}</option>
                  <option value="CANCELLED">{t("reservation.status.CANCELLED")}</option>
                  <option value="COMPLETED">{t("reservation.status.COMPLETED")}</option>
                </LiyonSelect>
              </div>
            }
            empty={{
              icon: <Clock aria-hidden="true" />,
              title: t("reservation.empty"),
            }}
            error={{
              icon: <AlertCircle aria-hidden="true" />,
              title: t("common.error"),
            }}
            renderRowMenu={(row) => (
              <>
                <RowMenuItem
                  onSelect={() => setViewingReservation(row)}
                  icon={<Eye aria-hidden="true" />}
                >
                  {t("reservation.action.view_detail")}
                </RowMenuItem>
                {(row.status === "PENDING" || row.status === "APPROVED") && (
                  <RowMenuItem
                    onSelect={() => handleCancelReservation(row.id)}
                    icon={<Ban aria-hidden="true" />}
                    danger
                  >
                    {t("reservation.action.cancel")}
                  </RowMenuItem>
                )}
              </>
            )}
          />
        </LiyonCard>
      )}

      {/* Tab Content 4: All Reservations (For Reviewers/Admins) */}
      {activeTab === "all_reservations" && (canApprove || canManage) && (
        <LiyonCard>
          <DataTable
            state={filteredAllReservations.length === 0 ? "empty" : "data"}
            columns={allColumns}
            rows={filteredAllReservations}
            getRowId={(r) => r.id}
            headHeading={t("reservation.tabs.all_reservations")}
            rowMenuLabel={(r) => r.title}
            toolbar={
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t("reservation.action.filter")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <LiyonSelect
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-8 text-xs"
                >
                  <option value="ALL">ทุกสถานะ</option>
                  <option value="PENDING">{t("reservation.status.PENDING")}</option>
                  <option value="APPROVED">{t("reservation.status.APPROVED")}</option>
                  <option value="REJECTED">{t("reservation.status.REJECTED")}</option>
                  <option value="CANCELLED">{t("reservation.status.CANCELLED")}</option>
                  <option value="COMPLETED">{t("reservation.status.COMPLETED")}</option>
                </LiyonSelect>
              </div>
            }
            empty={{
              icon: <Clock aria-hidden="true" />,
              title: t("reservation.empty"),
            }}
            error={{
              icon: <AlertCircle aria-hidden="true" />,
              title: t("common.error"),
            }}
            renderRowMenu={(row) => (
              <>
                <RowMenuItem
                  onSelect={() => setViewingReservation(row)}
                  icon={<Eye aria-hidden="true" />}
                >
                  {t("reservation.action.view_detail")}
                </RowMenuItem>
                {canApprove && row.status === "PENDING" && (
                  <RowMenuItem
                    onSelect={() => setReviewingReservation(row)}
                    icon={<ShieldCheck aria-hidden="true" />}
                  >
                    {t("reservation.dialog.review_title")}
                  </RowMenuItem>
                )}
                {row.status !== "CANCELLED" && row.status !== "COMPLETED" && (
                  <RowMenuItem
                    onSelect={() => handleCancelReservation(row.id)}
                    icon={<Ban aria-hidden="true" />}
                    danger
                  >
                    {t("reservation.action.cancel")}
                  </RowMenuItem>
                )}
              </>
            )}
          />
        </LiyonCard>
      )}

      {/* Tab Content 5: Manage Resources */}
      {activeTab === "manage_resources" && canManage && (
        <LiyonCard>
          <DataTable
            state={resources.length === 0 ? "empty" : "data"}
            columns={resourceColumns}
            rows={resources}
            getRowId={(r) => r.id}
            headHeading={t("reservation.tabs.manage_resources")}
            rowMenuLabel={(r) => r.code}
            toolbar={
              <Button
                size="sm"
                onClick={() => setIsAddResourceOpen(true)}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>{t("reservation.action.add_resource")}</span>
              </Button>
            }
            empty={{
              icon: <DoorOpen aria-hidden="true" />,
              title: t("reservation.empty_resources"),
            }}
            error={{
              icon: <AlertCircle aria-hidden="true" />,
              title: t("common.error"),
            }}
            renderRowMenu={(row) => (
              <RowMenuItem
                onSelect={() => handleToggleResourceActive(row.id, row.isActive)}
                icon={row.isActive ? <XCircle aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
              >
                {row.isActive ? "ปิดการใช้งาน" : "เปิดใช้งาน"}
              </RowMenuItem>
            )}
          />
        </LiyonCard>
      )}

      {/* Booking Dialog */}
      <BookingDialog
        open={isNewBookingOpen}
        onOpenChange={setIsNewBookingOpen}
        resources={resources}
        departments={departments}
        preselectedResource={selectedResource}
        onSuccess={refreshData}
      />

      {/* Review Dialog */}
      <ReviewDialog
        reservation={reviewingReservation}
        onOpenChange={(open) => !open && setReviewingReservation(null)}
        onSuccess={refreshData}
      />

      {/* Detail Dialog */}
      <ReservationDetailDialog
        reservation={viewingReservation}
        onOpenChange={(open) => !open && setViewingReservation(null)}
      />

      {/* Add Resource Dialog */}
      <ResourceDialog
        open={isAddResourceOpen}
        onOpenChange={setIsAddResourceOpen}
        onSuccess={refreshData}
      />
    </div>
  );
}
