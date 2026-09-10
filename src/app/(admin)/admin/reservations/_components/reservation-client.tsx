"use client";

import { useState, useTransition, useMemo } from "react";
import {
  CalendarDays,
  Plus,
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Car,
  DoorOpen,
  MapPin,
  Users,
  Phone,
  ShieldCheck,
  Eye,
  Ban,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import {
  LiyonCard,
  DataTable,
  StatusPill,
  LiyonDialog,
  LiyonDialogCloseButton,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
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
  createReservationAction,
  reviewReservationAction,
  cancelReservationAction,
  createResourceAction,
  toggleResourceActiveAction,
  checkConflictAction,
  getMyReservationsAction,
  getReservationsAction,
  getResourcesAction,
} from "@/features/reservation/actions";

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
  const [isPending, startTransition] = useTransition();

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
  const [bookingResourceId, setBookingResourceId] = useState("");
  const [bookingTitle, setBookingTitle] = useState("");
  const [bookingPurpose, setBookingPurpose] = useState("");
  const [bookingAttendees, setBookingAttendees] = useState(1);
  const [bookingDestination, setBookingDestination] = useState("");
  const [bookingDeptId, setBookingDeptId] = useState("");
  const [bookingStartTime, setBookingStartTime] = useState("");
  const [bookingEndTime, setBookingEndTime] = useState("");
  const [conflictNotice, setConflictNotice] = useState<{ hasConflict: boolean; message?: string } | null>(null);

  // Review Dialog States
  const [reviewingReservation, setReviewingReservation] = useState<ResourceReservationDto | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  // Detail Dialog States
  const [viewingReservation, setViewingReservation] = useState<ResourceReservationDto | null>(null);

  // Add Resource Dialog States
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [resType, setResType] = useState<"ROOM" | "VEHICLE">("ROOM");
  const [resCode, setResCode] = useState("");
  const [resNameTh, setResNameTh] = useState("");
  const [resNameEn, setResNameEn] = useState("");
  const [resDescription, setResDescription] = useState("");
  const [resCapacity, setResCapacity] = useState(10);
  const [resLocation, setResLocation] = useState("");
  const [resLicensePlate, setResLicensePlate] = useState("");
  const [resDriverName, setResDriverName] = useState("");
  const [resDriverPhone, setResDriverPhone] = useState("");
  const [resAmenities, setResAmenities] = useState("");

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

  // Open booking modal with pre-selected resource
  const handleOpenBooking = (resource?: ResourceItemDto) => {
    const res = resource ?? resources.find((r) => r.isActive) ?? null;
    setSelectedResource(res);
    setBookingResourceId(res ? res.id : "");
    setBookingTitle("");
    setBookingPurpose("");
    setBookingAttendees(1);
    setBookingDestination("");
    setBookingDeptId("");
    // Default start time: next hour, end time: +2 hours
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    const end = new Date(now);
    end.setHours(end.getHours() + 2);

    const pad = (n: number) => String(n).padStart(2, "0");
    const formatInputDateTime = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    setBookingStartTime(formatInputDateTime(now));
    setBookingEndTime(formatInputDateTime(end));
    setConflictNotice(null);
    setIsNewBookingOpen(true);
  };

  // Check Conflict Function
  const handleCheckConflict = async () => {
    if (!bookingResourceId || !bookingStartTime || !bookingEndTime) {
      toast.error(t("reservation.validation.invalid_time_range"));
      return;
    }

    const start = new Date(bookingStartTime);
    const end = new Date(bookingEndTime);

    if (end <= start) {
      setConflictNotice({
        hasConflict: true,
        message: t("reservation.validation.invalid_time_range"),
      });
      return;
    }

    const res = await checkConflictAction(bookingResourceId, start.toISOString(), end.toISOString());
    if (res.ok) {
      if (res.data.hasConflict && res.data.conflictingReservation) {
        setConflictNotice({
          hasConflict: true,
          message: `${t("reservation.validation.conflict_detected")} (${res.data.conflictingReservation.title})`,
        });
      } else {
        setConflictNotice({
          hasConflict: false,
          message: t("reservation.validation.available"),
        });
      }
    } else {
      toast.error(res.error.message);
    }
  };

  // Submit Reservation
  const handleSubmitReservation = () => {
    if (!bookingResourceId || !bookingTitle.trim() || !bookingStartTime || !bookingEndTime) {
      toast.error(t("common.fillRequired"));
      return;
    }

    startTransition(async () => {
      const res = await createReservationAction({
        resourceId: bookingResourceId,
        title: bookingTitle.trim(),
        purpose: bookingPurpose.trim() || undefined,
        attendeesCount: bookingAttendees,
        destination: bookingDestination.trim() || undefined,
        startTime: new Date(bookingStartTime).toISOString(),
        endTime: new Date(bookingEndTime).toISOString(),
        departmentId: bookingDeptId || undefined,
      });

      if (res.ok) {
        toast.success(t("reservation.notice.created"));
        setIsNewBookingOpen(false);
        refreshData();
        setActiveTab("my_reservations");
      } else {
        toast.error(res.error.message);
      }
    });
  };

  // Review (Approve/Reject)
  const handleReview = (action: "APPROVE" | "REJECT") => {
    if (!reviewingReservation) return;

    startTransition(async () => {
      const res = await reviewReservationAction({
        reservationId: reviewingReservation.id,
        action,
        reviewNotes: reviewNotes.trim() || undefined,
      });

      if (res.ok) {
        toast.success(
          action === "APPROVE"
            ? t("reservation.notice.approved")
            : t("reservation.notice.rejected")
        );
        setReviewingReservation(null);
        setReviewNotes("");
        refreshData();
      } else {
        toast.error(res.error.message);
      }
    });
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

  // Submit New Resource
  const handleCreateResource = () => {
    if (!resCode.trim() || !resNameTh.trim() || !resNameEn.trim()) {
      toast.error(t("common.fillRequired"));
      return;
    }

    startTransition(async () => {
      const amenitiesList = resAmenities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await createResourceAction({
        type: resType,
        code: resCode.trim(),
        nameTh: resNameTh.trim(),
        nameEn: resNameEn.trim(),
        description: resDescription.trim() || undefined,
        capacity: resCapacity,
        location: resLocation.trim() || undefined,
        licensePlate: resLicensePlate.trim() || undefined,
        driverName: resDriverName.trim() || undefined,
        driverPhone: resDriverPhone.trim() || undefined,
        amenities: amenitiesList,
        isActive: true,
      });

      if (res.ok) {
        toast.success(t("reservation.notice.resource_saved"));
        setIsAddResourceOpen(false);
        setResCode("");
        setResNameTh("");
        setResNameEn("");
        setResDescription("");
        setResLocation("");
        setResLicensePlate("");
        setResDriverName("");
        setResDriverPhone("");
        setResAmenities("");
        refreshData();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  // Filtered rooms and vehicles
  const roomItems = useMemo(
    () => resources.filter((r) => r.type === "ROOM" && (searchQuery ? (r.nameTh.toLowerCase().includes(searchQuery.toLowerCase()) || r.code.toLowerCase().includes(searchQuery.toLowerCase())) : true)),
    [resources, searchQuery]
  );

  const vehicleItems = useMemo(
    () => resources.filter((r) => r.type === "VEHICLE" && (searchQuery ? (r.nameTh.toLowerCase().includes(searchQuery.toLowerCase()) || r.code.toLowerCase().includes(searchQuery.toLowerCase()) || (r.licensePlate && r.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()))) : true)),
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

  // Status Pill Tone Helper
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("reservation.action.filter")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {roomItems.map((room) => (
              <LiyonCard key={room.id} className="overflow-hidden flex flex-col justify-between border hover:shadow-md transition-shadow">
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded">
                        {room.code}
                      </span>
                      <h3 className="text-lg font-semibold text-foreground mt-1.5">
                        {locale === "en" ? room.nameEn : room.nameTh}
                      </h3>
                      {room.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{room.location}</span>
                        </div>
                      )}
                    </div>
                    <StatusPill tone={room.isActive ? "ok" : "off"}>
                      {room.isActive ? "ว่าง/พร้อมใช้" : "ปิดปรับปรุง"}
                    </StatusPill>
                  </div>

                  {room.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {room.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>รองรับความจุ: <strong>{room.capacity}</strong> ที่นั่ง</span>
                  </div>

                  {room.amenities.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("reservation.field.amenities")}:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {room.amenities.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-md bg-secondary/60 px-2 py-0.5 text-xs text-secondary-foreground"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-border p-4 bg-muted/20">
                  <Button
                    onClick={() => handleOpenBooking(room)}
                    disabled={!room.isActive || !canCreate}
                    className="w-full gap-2"
                  >
                    <CalendarDays className="h-4 w-4" />
                    <span>{t("reservation.action.book")}</span>
                  </Button>
                </div>
              </LiyonCard>
            ))}
          </div>

          {roomItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {t("reservation.empty_resources")}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Vehicles */}
      {activeTab === "vehicles" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("reservation.action.filter")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vehicleItems.map((vehicle) => (
              <LiyonCard key={vehicle.id} className="overflow-hidden flex flex-col justify-between border hover:shadow-md transition-shadow">
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs text-sky-600 font-medium bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded">
                        {vehicle.code}
                      </span>
                      <h3 className="text-lg font-semibold text-foreground mt-1.5">
                        {locale === "en" ? vehicle.nameEn : vehicle.nameTh}
                      </h3>
                      {vehicle.licensePlate && (
                        <div className="flex items-center gap-1 font-mono text-xs font-bold text-foreground mt-1">
                          <Car className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>ทะเบียน: {vehicle.licensePlate}</span>
                        </div>
                      )}
                    </div>
                    <StatusPill tone={vehicle.isActive ? "ok" : "off"}>
                      {vehicle.isActive ? "พร้อมใช้งาน" : "ปิดปรับปรุง"}
                    </StatusPill>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-foreground">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>ความจุผู้โดยสาร: <strong>{vehicle.capacity}</strong> ที่นั่ง</span>
                    </div>

                    {vehicle.driverName && (
                      <div className="flex items-center gap-2 text-foreground">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>พนักงานขับรถ: {vehicle.driverName}</span>
                      </div>
                    )}

                    {vehicle.driverPhone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>เบอร์ติดต่อ: {vehicle.driverPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-border p-4 bg-muted/20">
                  <Button
                    onClick={() => handleOpenBooking(vehicle)}
                    disabled={!vehicle.isActive || !canCreate}
                    className="w-full gap-2"
                  >
                    <CalendarDays className="h-4 w-4" />
                    <span>{t("reservation.action.book")}</span>
                  </Button>
                </div>
              </LiyonCard>
            ))}
          </div>

          {vehicleItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {t("reservation.empty_resources")}
            </div>
          )}
        </div>
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
                    onSelect={() => {
                      setReviewingReservation(row);
                      setReviewNotes("");
                    }}
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

      {/* -------------------- Dialog 1: New Reservation -------------------- */}
      <LiyonDialog open={isNewBookingOpen} onOpenChange={setIsNewBookingOpen} wide>
        <LiyonDialogCloseButton label="Close" />
        <LiyonDialogHeader
          title={t("reservation.dialog.new_title")}
          description={t("reservation.dialog.new_desc")}
        />

          <LiyonDialogBody className="space-y-4 max-h-[75vh] overflow-y-auto p-6">
            <LiyonField label={t("reservation.field.resource")}>
              <LiyonSelect
                value={bookingResourceId}
                onChange={(e) => {
                  const resId = e.target.value;
                  setBookingResourceId(resId);
                  const selected = resources.find((r) => r.id === resId) ?? null;
                  setSelectedResource(selected);
                  setConflictNotice(null);
                }}
              >
                <option value="">-- เลือกห้องประชุมหรือยานพาหนะ --</option>
                {resources
                  .filter((r) => r.isActive)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.type === "ROOM" ? "ห้องประชุม" : "ยานพาหนะ"}] {r.code} - {r.nameTh} (จุ {r.capacity} คน)
                    </option>
                  ))}
              </LiyonSelect>
            </LiyonField>

            {selectedResource && (
              <div className="rounded-md bg-muted/40 p-3 text-xs space-y-1">
                <div className="font-semibold text-foreground">
                  {selectedResource.nameTh} ({selectedResource.nameEn})
                </div>
                <div>
                  {selectedResource.type === "ROOM"
                    ? `สถานที่: ${selectedResource.location || "-"}`
                    : `ทะเบียน: ${selectedResource.licensePlate || "-"} | คนขับ: ${selectedResource.driverName || "-"} (${selectedResource.driverPhone || "-"})`}
                </div>
                <div>ความจุสูงสุด: {selectedResource.capacity} คน/ที่นั่ง</div>
              </div>
            )}

            <LiyonField label={t("reservation.field.title")}>
              <input
                type="text"
                placeholder="เช่น การประชุมคณะกรรมการประจำคณะ ครั้งที่ 3/2569"
                value={bookingTitle}
                onChange={(e) => setBookingTitle(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </LiyonField>

            <LiyonField label={t("reservation.field.purpose")}>
              <textarea
                placeholder="ระบุวัตถุประสงค์และรายละเอียดการใช้งาน"
                rows={2}
                value={bookingPurpose}
                onChange={(e) => setBookingPurpose(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </LiyonField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <LiyonField label={t("reservation.field.attendees_count")}>
                <input
                  type="number"
                  min={1}
                  max={selectedResource ? selectedResource.capacity : 100}
                  value={bookingAttendees}
                  onChange={(e) => setBookingAttendees(Number(e.target.value))}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </LiyonField>

              <LiyonField label={t("reservation.field.department")}>
                <LiyonSelect
                  value={bookingDeptId}
                  onChange={(e) => setBookingDeptId(e.target.value)}
                >
                  <option value="">-- ไม่ระบุหน่วยงาน --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nameTh}
                    </option>
                  ))}
                </LiyonSelect>
              </LiyonField>
            </div>

            {selectedResource?.type === "VEHICLE" && (
              <LiyonField label={t("reservation.field.destination")}>
                <input
                  type="text"
                  placeholder="เช่น สำนักงานคณะกรรมการการอุดมศึกษา กรุงเทพฯ"
                  value={bookingDestination}
                  onChange={(e) => setBookingDestination(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </LiyonField>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <LiyonField label={t("reservation.field.start_time")}>
                <input
                  type="datetime-local"
                  value={bookingStartTime}
                  onChange={(e) => {
                    setBookingStartTime(e.target.value);
                    setConflictNotice(null);
                  }}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </LiyonField>

              <LiyonField label={t("reservation.field.end_time")}>
                <input
                  type="datetime-local"
                  value={bookingEndTime}
                  onChange={(e) => {
                    setBookingEndTime(e.target.value);
                    setConflictNotice(null);
                  }}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </LiyonField>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCheckConflict}
                className="text-xs"
              >
                {t("reservation.action.check_availability")}
              </Button>

              {conflictNotice && (
                <div className={`text-xs font-medium flex items-center gap-1.5 ${conflictNotice.hasConflict ? "text-destructive" : "text-emerald-600"}`}>
                  {conflictNotice.hasConflict ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <span>{conflictNotice.message}</span>
                </div>
              )}
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter className="p-4 border-t border-border flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsNewBookingOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleSubmitReservation}
              disabled={isPending}
              className="bg-primary text-primary-foreground"
            >
              {t("reservation.action.book")}
            </Button>
          </LiyonDialogFooter>
      </LiyonDialog>

      {/* -------------------- Dialog 2: Review (Approve/Reject) -------------------- */}
      <LiyonDialog open={!!reviewingReservation} onOpenChange={(open) => !open && setReviewingReservation(null)} wide>
        {reviewingReservation && (
          <>
            <LiyonDialogCloseButton label="Close" />
            <LiyonDialogHeader
              title={t("reservation.dialog.review_title")}
              description={t("reservation.dialog.review_desc")}
            />

            <LiyonDialogBody className="space-y-4 p-6">
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm text-foreground">{reviewingReservation.title}</span>
                  <StatusPill tone="warn">รออนุมัติ</StatusPill>
                </div>
                <div>ทรัพยากร: <strong>{reviewingReservation.resourceNameTh}</strong> ({reviewingReservation.resourceCode})</div>
                <div>ผู้ยื่นจอง: {reviewingReservation.userName} ({reviewingReservation.userEmail})</div>
                <div>
                  วัน-เวลา: {formatDate(new Date(reviewingReservation.startTime), locale, { time: true })} ถึง {formatDate(new Date(reviewingReservation.endTime), locale, { time: true })}
                </div>
                {reviewingReservation.destination && (
                  <div>จุดหมายปลายทาง: {reviewingReservation.destination}</div>
                )}
                {reviewingReservation.purpose && (
                  <div>วัตถุประสงค์: {reviewingReservation.purpose}</div>
                )}
              </div>

              <LiyonField label={t("reservation.field.review_notes")}>
                <textarea
                  placeholder="ระบุเหตุผลหรือข้อแนะนำเพิ่มเติม (ถ้ามี)"
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </LiyonField>
            </LiyonDialogBody>

            <LiyonDialogFooter className="p-4 border-t border-border flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setReviewingReservation(null)}
              >
                ปิด
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReview("REJECT")}
                disabled={isPending}
                className="gap-1.5"
              >
                <XCircle className="h-4 w-4" />
                <span>{t("reservation.action.reject")}</span>
              </Button>
              <Button
                onClick={() => handleReview("APPROVE")}
                disabled={isPending}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Check className="h-4 w-4" />
                <span>{t("reservation.action.approve")}</span>
              </Button>
            </LiyonDialogFooter>
          </>
        )}
      </LiyonDialog>

      {/* -------------------- Dialog 3: View Details -------------------- */}
      <LiyonDialog open={!!viewingReservation} onOpenChange={(open) => !open && setViewingReservation(null)}>
        {viewingReservation && (
          <>
            <LiyonDialogCloseButton label="Close" />
            <LiyonDialogHeader
              title={viewingReservation.title}
              description={`รหัสการจอง: ${viewingReservation.id}`}
            />

            <LiyonDialogBody className="space-y-4 p-6 text-sm">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-muted-foreground">{t("reservation.field.status")}</span>
                <StatusPill tone={getStatusTone(viewingReservation.status)}>
                  {t(`reservation.status.${viewingReservation.status}` as const)}
                </StatusPill>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">ทรัพยากร: </span>
                  <strong className="text-foreground">{viewingReservation.resourceNameTh} ({viewingReservation.resourceCode})</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">ผู้จอง: </span>
                  <span className="text-foreground">{viewingReservation.userName} ({viewingReservation.userEmail})</span>
                </div>
                <div>
                  <span className="text-muted-foreground">หน่วยงาน: </span>
                  <span className="text-foreground">{viewingReservation.departmentNameTh || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">เวลาเริ่มต้น: </span>
                  <span className="text-foreground">{formatDate(new Date(viewingReservation.startTime), locale, { time: true })}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">เวลาสิ้นสุด: </span>
                  <span className="text-foreground">{formatDate(new Date(viewingReservation.endTime), locale, { time: true })}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">จำนวนผู้เข้าร่วม: </span>
                  <span className="text-foreground">{viewingReservation.attendeesCount} คน</span>
                </div>
                {viewingReservation.destination && (
                  <div>
                    <span className="text-muted-foreground">สถานที่ปลายทาง: </span>
                    <span className="text-foreground">{viewingReservation.destination}</span>
                  </div>
                )}
                {viewingReservation.purpose && (
                  <div className="mt-2 rounded-md bg-muted/40 p-3">
                    <div className="font-medium text-foreground mb-1">วัตถุประสงค์:</div>
                    <div className="text-muted-foreground">{viewingReservation.purpose}</div>
                  </div>
                )}
                {viewingReservation.reviewNotes && (
                  <div className="mt-2 rounded-md bg-amber-50 dark:bg-amber-950/30 p-3 border border-amber-200 dark:border-amber-800">
                    <div className="font-medium text-amber-800 dark:text-amber-200 mb-1">ผลการพิจารณา:</div>
                    <div className="text-amber-700 dark:text-amber-300">{viewingReservation.reviewNotes}</div>
                  </div>
                )}
              </div>
            </LiyonDialogBody>

            <LiyonDialogFooter className="p-4 border-t border-border flex justify-end">
              <Button variant="outline" onClick={() => setViewingReservation(null)}>
                ปิด
              </Button>
            </LiyonDialogFooter>
          </>
        )}
      </LiyonDialog>

      {/* -------------------- Dialog 4: Add Resource -------------------- */}
      <LiyonDialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen} wide>
        <LiyonDialogCloseButton label="Close" />
        <LiyonDialogHeader
          title={t("reservation.action.add_resource")}
          description="กรอกข้อมูลห้องประชุมหรือยานพาหนะใหม่เพื่อให้บริการในระบบ"
        />

          <LiyonDialogBody className="space-y-4 max-h-[75vh] overflow-y-auto p-6">
            <div className="grid grid-cols-2 gap-4">
              <LiyonField label="ประเภททรัพยากร">
                <LiyonSelect
                  value={resType}
                  onChange={(e) => setResType(e.target.value as "ROOM" | "VEHICLE")}
                >
                  <option value="ROOM">ห้องประชุม (Room)</option>
                  <option value="VEHICLE">ยานพาหนะ (Vehicle)</option>
                </LiyonSelect>
              </LiyonField>

              <LiyonField label={t("reservation.field.code")}>
                <input
                  type="text"
                  placeholder="เช่น RM-301 หรือ VAN-01"
                  value={resCode}
                  onChange={(e) => setResCode(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("reservation.field.name_th")}>
                <input
                  type="text"
                  placeholder="เช่น ห้องประชุมทองกวาว"
                  value={resNameTh}
                  onChange={(e) => setResNameTh(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </LiyonField>

              <LiyonField label={t("reservation.field.name_en")}>
                <input
                  type="text"
                  placeholder="e.g. Thongkwaw Conference Room"
                  value={resNameEn}
                  onChange={(e) => setResNameEn(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <LiyonField label={t("reservation.field.capacity")}>
                <input
                  type="number"
                  min={1}
                  value={resCapacity}
                  onChange={(e) => setResCapacity(Number(e.target.value))}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </LiyonField>

              {resType === "ROOM" ? (
                <LiyonField label={t("reservation.field.location")}>
                  <input
                    type="text"
                    placeholder="เช่น อาคาร 4 ชั้น 3"
                    value={resLocation}
                    onChange={(e) => setResLocation(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </LiyonField>
              ) : (
                <LiyonField label={t("reservation.field.license_plate")}>
                  <input
                    type="text"
                    placeholder="เช่น นข-4455 เชียงใหม่"
                    value={resLicensePlate}
                    onChange={(e) => setResLicensePlate(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </LiyonField>
              )}
            </div>

            {resType === "VEHICLE" && (
              <div className="grid grid-cols-2 gap-4">
                <LiyonField label={t("reservation.field.driver_name")}>
                  <input
                    type="text"
                    placeholder="ชื่อ-นามสกุล คนขับ"
                    value={resDriverName}
                    onChange={(e) => setResDriverName(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </LiyonField>

                <LiyonField label={t("reservation.field.driver_phone")}>
                  <input
                    type="text"
                    placeholder="081-xxx-xxxx"
                    value={resDriverPhone}
                    onChange={(e) => setResDriverPhone(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </LiyonField>
              </div>
            )}

            <LiyonField label="อุปกรณ์อำนวยความสะดวก (คั่นด้วยเครื่องหมายจุลภาค ,)">
              <input
                type="text"
                placeholder="เช่น โปรเจกเตอร์, ไมโครโฟนไร้สาย, ระบบประชุมทางไกล Zoom"
                value={resAmenities}
                onChange={(e) => setResAmenities(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </LiyonField>

            <LiyonField label={t("reservation.field.description")}>
              <textarea
                placeholder="รายละเอียดเพิ่มเติม"
                rows={2}
                value={resDescription}
                onChange={(e) => setResDescription(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </LiyonField>
          </LiyonDialogBody>

          <LiyonDialogFooter className="p-4 border-t border-border flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddResourceOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleCreateResource}
              disabled={isPending}
              className="bg-primary text-primary-foreground"
            >
              บันทึกทรัพยากร
            </Button>
          </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
