import { TrafficControlGrids } from '../../features/traffic/TrafficControlGrids';
import { AppToast } from '../AppToast';
import '../../features/traffic/trafficWorkspace.css';
import { useDoorTraffics } from '../../features/traffic/useDoorTraffics';
import { useTrafficOperations } from '../../features/traffic/useTrafficOperations';
import { useTrafficDoor } from '../../features/traffic/useTrafficDoor';
import { useTrafficKeyboardNavigation } from '../../features/traffic/useTrafficKeyboardNavigation';
import { trafficActionState } from '../../features/traffic/trafficActionState';
import { TrafficOperationActions } from '../../features/traffic/TrafficOperationActions';
import { TrafficPaymentPopup, type TrafficPaymentPresentation } from '../../features/traffic/TrafficPaymentPopup';
import { trafficPaymentPolicy, type TrafficPaymentSource } from '../../features/traffic/trafficPaymentPolicy';
import { useTrafficIdentity } from '../../features/traffic/useTrafficIdentity';
import { TrafficIdentitySummary } from '../../features/traffic/TrafficIdentitySummary';
import { TrafficWorkspaceSplitter } from '../../features/traffic/TrafficWorkspaceSplitter';
import { TrafficDetectionPanel } from '../../features/traffic/TrafficDetectionPanel';
import { TrafficVehicleDialog } from '../../features/traffic/TrafficVehicleDialog';
import type { TrafficIdentity, VehicleDraft } from '../../features/traffic/trafficIdentityService';
import { trafficAlerts } from '../../features/traffic/trafficPolicy';
import { appConfig } from '../../config';
import { hasOpenTraffic, hasTrafficTime, TrafficOperationError, trafficResult } from '../../features/traffic/trafficOperationService';
import { useTranslation } from 'react-i18next';
import { AppPopup } from '../AppPopup';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Alert, Box, Button, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, TextField, Tooltip, Typography } from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import { ApiError } from "../../api/client";
import { cargoApi, parkingApi, trafficApi } from "../../api/management";
import type {
  HshDetectionEvent,
  HshDetectionHandler,
} from "../../api/hshDetectionRealtime";
import { AppDataGrid } from "../AppDataGrid";
import { ConfirmDialog } from "../ConfirmDialog";
import { EosDateTimePicker } from "../EosDateTimePicker";
import {
  IranianPlateInput,
  isValidIranianPlate,
  normalizeIranianPlateValue,
  type VehiclePlateType,
} from "../IranianPlateInput";
import { ManagementWorkspaceFrame } from "./ManagementWorkspaceFrame";
import { ResourceState } from "./ResourceState";
import { TrafficCameraPanels } from "./TrafficCameraPanels";
import {
  asRows,
  recordValue,
  type Language,
  type RecordValue,
} from "./managementTypes";

type Props = {
  title: string;
  pageTitle?: string;
  parkingId: number;
  language: Language;
  showCameras?: boolean;
  userId?: number;
  canEditVehicle?: boolean;
  canSearchHistory?: boolean;
  initialIdentity?: { plate: string; card: string; member: string; doorId: string };
  onBusyChange?: (busy: boolean) => void;
};
type Option = { id: number; label: string };
type TrafficRow = RecordValue;
type OperationMode = "idle" | "enter" | "exit";
type CargoFormState = {
  driverId: string;
  merchandiseId: string;
  originId: string;
  destinationId: string;
  weight: string;
  count: string;
  reason: string;
  description: string;
};

const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const dateTime = (value: unknown, isPersian: boolean) => {
  const parsed = new Date(String(value ?? ""));
  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleString(isPersian ? "fa-IR" : "en-US");
};
const inputDateTime = (value: unknown) => {
  const parsed = new Date(String(value ?? ""));
  return Number.isNaN(parsed.getTime())
    ? ""
    : `${isoDate(parsed)}T${parsed.toISOString().slice(11, 16)}`;
};
const apiDateTime = (value: string) =>
  value ? `${value.replace("T", " ")}:00` : null;
const valueOf = (row: RecordValue, key: string) => recordValue(row, key);
const numberOf = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const payTypeLabel = (value: unknown, isPersian: boolean) => {
  if (value === null || value === undefined || value === "") return "—";
  const labels = isPersian
    ? [
        "پرداخت نشده",
        "پرداخت نقدی",
        "پرداخت بانکی",
        "پرداخت نقدی پارکبان",
        "پرداخت بانکی پارکبان",
        "منقضی",
        "پرداخت منقضی",
        "پرداخت منقضی",
        "پرداخت منقضی",
        "پرداخت اولیه با پارکبان",
      ]
    : [
        "Not paid",
        "Cash payment",
        "Bank payment",
        "Cash payment by attendant",
        "Bank payment by attendant",
        "Expired",
        "Expired cash payment",
        "Expired electronic payment",
        "Expired cash payment",
        "Initial payment by attendant",
      ];
  const numericValue = Number(value);
  return Number.isInteger(numericValue) && labels[numericValue]
    ? labels[numericValue]
    : String(value);
};

function responsePage(input: unknown) {
  const root =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};
  const wrapped = root.Values ?? root.values ?? root.Data ?? root.data ?? input;
  if (Array.isArray(wrapped))
    return {
      items: wrapped.filter((row): row is RecordValue =>
        Boolean(row && typeof row === "object"),
      ),
    };
  const page =
    wrapped && typeof wrapped === "object"
      ? (wrapped as Record<string, unknown>)
      : {};
  const items = page.Items ?? page.items ?? page.Values ?? page.values;
  return {
    items: Array.isArray(items)
      ? items.filter((row): row is RecordValue =>
          Boolean(row && typeof row === "object"),
        )
      : [],
  };
}

function optionRows(input: unknown): Option[] {
  return asRows(input)
    .map((row) => ({
      id: numberOf(valueOf(row, "Id")),
      label: String(
        valueOf(row, "Title") ??
          valueOf(row, "Name") ??
          valueOf(row, "DoorName") ??
          "",
      ),
    }))
    .filter((option) => option.id > 0 && option.label);
}

export function TrafficRecordsWorkspace({
  title,
  pageTitle,
  parkingId,
  language,
  showCameras = false,
  userId,
  canEditVehicle = false,
  canSearchHistory = false,
  initialIdentity,
  onBusyChange,
}: Props) {
  const { t } = useTranslation(undefined, { lng: language });
  const doorLabelId = useId();
  const topPanelRef = useRef<HTMLElement>(null);
  const plateFieldRef = useRef<HTMLDivElement>(null);
  const [topHeight, setTopHeight] = useState<number | null>(null);
  const operations = useTrafficOperations();
  const lookupSequence = useRef(0);
  const isPersian = language === "fa";
  const [doors, setDoors] = useState<Option[]>([]);
  const [recordRows, setRows] = useState<TrafficRow[]>([]);
  const [startDate, setStartDate] = useState(() => {
    const value = new Date();
    value.setMonth(value.getMonth() - 1);
    return isoDate(value);
  });
  const [endDate, setEndDate] = useState(() => isoDate(new Date()));
  const [sourceType, setSourceType] = useState("0");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editEnter, setEditEnter] = useState("");
  const [editExit, setEditExit] = useState("");
  const [cargoOpen, setCargoOpen] = useState(false);
  const [cargoRow, setCargoRow] = useState<TrafficRow | null>(null);
  const [cargoOutbound, setCargoOutbound] = useState(false);
  const [cargoLoading, setCargoLoading] = useState(false);
  const [cargoError, setCargoError] = useState("");
  const [cargoDrivers, setCargoDrivers] = useState<RecordValue[]>([]);
  const [cargoMerchandises, setCargoMerchandises] = useState<RecordValue[]>([]);
  const [cargoCompanies, setCargoCompanies] = useState<RecordValue[]>([]);
  const [cargoForm, setCargoForm] = useState<CargoFormState>({
    driverId: "",
    merchandiseId: "",
    originId: "",
    destinationId: "",
    weight: "0",
    count: "0",
    reason: "",
    description: "",
  });
  const [plate, setPlate] = useState(initialIdentity?.plate ?? '');
  const [cardNumber, setCardNumber] = useState(initialIdentity?.card ?? '');
  const [memberCode, setMemberCode] = useState(initialIdentity?.member ?? '');
  const [carType, setCarType] = useState<VehiclePlateType>("0");
  const [entryDoorId, setEntryDoorId] = useState("");
  const trafficDoor = useTrafficDoor(Number(entryDoorId), showCameras);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyBusy, setHistoryBusy] = useState(false);
  const identity = useTrafficIdentity(parkingId, entryDoorId, canEditVehicle);
  const [vehicleDraft, setVehicleDraft] = useState<VehicleDraft | null>(null);
  const [vehicleEditing, setVehicleEditing] = useState(false);
  const [vehicleBusy, setVehicleBusy] = useState(false);
  const [vehicleError, setVehicleError] = useState('');
  const lookupInFlight = useRef(false);
  const detectionLocked = useRef(false);
  const [entryDateTime, setEntryDateTime] = useState("");
  const [exitDateTime, setExitDateTime] = useState("");
  const [carInfo, setCarInfo] = useState<RecordValue | null>(null);
  const actionState = trafficActionState(trafficDoor.door?.type, carInfo);
  const [memberCredit, setMemberCredit] = useState<RecordValue | null>(null);
  const [operationMode, setOperationMode] = useState<OperationMode>("idle");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [exitBill, setExitBill] = useState<RecordValue | null>(null);
  const [billOpen, setBillOpen] = useState(false);
  const [paymentPresentation, setPaymentPresentation] = useState<TrafficPaymentPresentation | null>(null);
  const [paymentError, setPaymentError] = useState('');
  const [paymentPending, setPaymentPending] = useState(false);
  const paymentPaperRef = useRef<HTMLDivElement>(null);
  const billBlocksInput = billOpen && paymentPresentation?.modal !== false;
  const [latestDetection, setLatestDetection] = useState<{
    event: HshDetectionEvent;
    fullFrameUrl: string | null;
    plateImageUrl: string | null;
  } | null>(null);
  const [recordLoading, setLoading] = useState(true);
  const doorTraffics = useDoorTraffics(Number(entryDoorId), showCameras);
  const rows = showCameras ? doorTraffics.rows : recordRows;
  const loading = showCameras ? doorTraffics.loading : recordLoading;
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => { detectionLocked.current = working || billBlocksInput || historyOpen || lookupLoading || vehicleBusy || Boolean(vehicleDraft) || Boolean(carInfo); }, [working, billBlocksInput, historyOpen, lookupLoading, vehicleBusy, vehicleDraft, carInfo]);
  useEffect(() => { onBusyChange?.(working || lookupLoading || billBlocksInput || editOpen || deleteOpen || cargoOpen); }, [onBusyChange, working, lookupLoading, billBlocksInput, editOpen, deleteOpen, cargoOpen]);
  const handleDetection = useCallback<HshDetectionHandler>(async (event, loadArtifact) => {
    const sequence = lookupSequence.current;
    const nextPlate = normalizeIranianPlateValue(event.plateText);
    const [fullFrameUrl, plateImageUrl] = await Promise.all([
      loadArtifact("FullFrameRaw").catch(() => null),
      loadArtifact("PlateCrop").catch(() => null),
    ]);
    if (sequence !== lookupSequence.current) {
      if (fullFrameUrl) URL.revokeObjectURL(fullFrameUrl);
      if (plateImageUrl) URL.revokeObjectURL(plateImageUrl);
      return;
    }
    setLatestDetection({ event, fullFrameUrl, plateImageUrl });
    if (detectionLocked.current) return;
    lookupSequence.current++;
    if (nextPlate) setPlate(nextPlate);
    setCarInfo(null);
    setMemberCredit(null);
    setOperationMode("idle");
    const detectedAt = inputDateTime(event.occurredAtUtc);
    if (event.source.direction === "exit") setExitDateTime(detectedAt);
    else setEntryDateTime(detectedAt);
  }, []);

  useEffect(() => {
    return () => {
      if (latestDetection?.fullFrameUrl) URL.revokeObjectURL(latestDetection.fullFrameUrl);
      if (latestDetection?.plateImageUrl) URL.revokeObjectURL(latestDetection.plateImageUrl);
    };
  }, [latestDetection?.fullFrameUrl, latestDetection?.plateImageUrl]);

  useEffect(() => {
    setLatestDetection(null);
    lookupSequence.current++;
    setCarInfo(null);
    setMemberCredit(null);
    setOperationMode('idle');
    setLookupLoading(false);
    setVehicleDraft(null);
    setVehicleError('');
    return () => { lookupSequence.current++; };
  }, [parkingId, entryDoorId]);
  const copy = isPersian
    ? {
        count: "رکورد",
        registerTitle: "ثبت تردد",
        detailsTitle: "ریز تردد",
        plate: "پلاک",
        card: "شماره کارت",
        memberCode: "کد عضو",
        door: "نام درب",
        entry: "تاریخ و زمان ورود",
        exit: "تاریخ و زمان خروج",
        register: "ثبت",
        start: "ورود از",
        end: "تا",
        source: "نوع منبع",
        all: "همه",
        allDoors: "همه درب‌ها",
        search: "جستجوی پلاک یا عضو",
        show: "نمایش",
        edit: "ویرایش",
        remove: "حذف",
        cancel: "انصراف",
        empty: "ترددی برای نمایش وجود ندارد.",
        loading: "در حال دریافت ترددها...",
        loadError: "دریافت ترددها ناموفق بود.",
        saveError: "عملیات تردد ناموفق بود.",
        saved: "تردد با موفقیت ثبت شد.",
        updated: "تغییرات تردد ذخیره شد.",
        deleted: "رکورد تردد حذف شد.",
        deleteConfirm: "آیا از حذف رکورد انتخاب‌شده مطمئن هستید؟",
        editTitle: "ویرایش مشخصات ورود و خروج",
        required: "پلاک، درب و زمان ورود را کامل کنید.",
      }
    : {
        count: "records",
        registerTitle: "Register traffic",
        detailsTitle: "Traffic details",
        plate: "Plate",
        card: "Card number",
        memberCode: "Member code",
        door: "Door",
        entry: "Entry date and time",
        exit: "Exit date and time",
        register: "Register",
        start: "Entry from",
        end: "To",
        source: "Source type",
        all: "All",
        allDoors: "All doors",
        search: "Search plate or member",
        show: "Show",
        edit: "Edit",
        remove: "Delete",
        cancel: "Cancel",
        empty: "No traffic records found.",
        loading: "Loading traffic records...",
        loadError: "Failed to load traffic records.",
        saveError: "Traffic operation failed.",
        saved: "Traffic was registered.",
        updated: "Traffic changes saved.",
        deleted: "Traffic record deleted.",
        deleteConfirm: "Delete the selected traffic record?",
        editTitle: "Edit entry and exit details",
        required: "Plate, door and entry time are required.",
      };

  useEffect(() => {
    parkingApi
      .getDoors(parkingId)
      .then((response) => {
        const next = optionRows(response);
        setDoors(next);
        const initialDoor = next.find(door => String(door.id) === initialIdentity?.doorId);
        setEntryDoorId(String(initialDoor?.id ?? next[0]?.id ?? ""));
      })
      .catch(() => setError(copy.loadError));
  }, [parkingId]);
  const load = async () => {
    if (showCameras) { await doorTraffics.refresh(); return; }
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await trafficApi.getAllTraffics({
            PageNumber: 1,
            PageSize: 500,
            Filters: {
              StartDateTime: `${startDate}T00:00:00`,
              EndDateTime: `${endDate}T23:59:59`,
              DumpType: Number(sourceType),
              ParkingId: parkingId,
            },
          });
      setRows(responsePage(response).items);
      setSelectedId(null);
    } catch (cause) {
      setRows([]);
      setError(
        cause instanceof ApiError && cause.status === 403
          ? isPersian
            ? "دسترسی مشاهده ترددها مجاز نیست."
            : "The current user is not allowed to view traffic records."
          : copy.loadError,
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!showCameras) void load();
  }, [parkingId, showCameras]);
  const applyIdentity = (details: TrafficIdentity) => {
    const info = details.info;
    identity.setDetails(details);
    setCarInfo(info);
    setPlate(normalizeIranianPlateValue(String(valueOf(info, 'Plate') ?? plate)));
    setCardNumber(String(valueOf(info, 'CardNumber') ?? cardNumber));
    setMemberCode(String(valueOf(info, 'MemberCode') ?? memberCode));
    const selectedCar = details.cars.find(car => car.Id === numberOf(valueOf(info, 'CarId')));
    if (selectedCar) setCarType(String(selectedCar.CarType) as VehiclePlateType);
    setOperationMode(hasOpenTraffic(info) ? 'exit' : 'enter');
    const needsSelection = !hasOpenTraffic(info) && numberOf(valueOf(info, 'MemberId')) > 0 && !selectedCar;
    keyboard.requestFocus(needsSelection ? 'vehicle' : 'actions');
  };
  const operationError = (cause: unknown, fallback: string) => cause instanceof TrafficOperationError
    ? cause.messageKey ? t(`trafficIdentity.${cause.messageKey}`) : cause.userMessage || fallback : fallback;
  const lookupCar = async (force = false, source?: 'plate' | 'card' | 'member') => {
    // Moving focus to Register must not launch a second lookup and disable the click.
    if (lookupInFlight.current || working || billBlocksInput || vehicleBusy || (!force && carInfo && operationMode !== 'idle') || (!plate && !cardNumber && !memberCode)) return;
    if (showCameras && source === 'plate' && !isValidIranianPlate(plate, carType)) return;
    if (showCameras && ((source === 'card' && !cardNumber.trim()) || (source === 'member' && !memberCode.trim()))) return;
    if (showCameras && source && source !== 'member' && trafficDoor.door?.authorizationType === 3) {
      if (!cardNumber.trim()) { keyboard.requestFocus('card'); return; }
      if (!isValidIranianPlate(plate, carType)) { keyboard.requestFocus('plate'); return; }
    }
    const requestId = ++lookupSequence.current;
    lookupInFlight.current = true;
    setLookupLoading(true);
    setError("");
    try {
      if (showCameras) {
        const details = await identity.lookup(plate, cardNumber, memberCode);
        if (requestId !== lookupSequence.current) return;
        applyIdentity(details);
        return;
      }
      const info = await operations.lookup(
        parkingId,
        plate,
        cardNumber,
        memberCode,
      );
      if (requestId !== lookupSequence.current) return;
      if (info) {
        setCarInfo(info);
        setPlate(normalizeIranianPlateValue(String(valueOf(info, "Plate") ?? plate)));
        setCardNumber(String(valueOf(info, "CardNumber") ?? cardNumber));
        setMemberCode(String(valueOf(info, "MemberCode") ?? memberCode));
        const hasOpenEntry = hasOpenTraffic(info);
        setOperationMode(hasOpenEntry ? "exit" : "enter");
        const memberId = numberOf(valueOf(info, "MemberId"));
        if (memberId > 0) {
          const creditResponse =
            await trafficApi.getMemberCurrentCreditInfo(memberId);
          if (requestId !== lookupSequence.current) return;
          const creditRoot =
            creditResponse && typeof creditResponse === "object"
              ? (creditResponse as Record<string, unknown>)
              : {};
          const creditValues =
            creditRoot.Values ??
            creditRoot.values ??
            creditRoot.Data ??
            creditRoot.data ??
            creditResponse;
          setMemberCredit(
            Array.isArray(creditValues)
              ? ((creditValues[0] as RecordValue | undefined) ?? null)
              : creditValues && typeof creditValues === "object"
                ? (creditValues as RecordValue)
                : null,
          );
        }
      } else {
        setOperationMode("enter");
      }
    } catch (cause) {
      if (requestId !== lookupSequence.current) return;
      setCarInfo(null);
      identity.setDetails(null);
      setOperationMode("idle");
      setError(
        operationError(cause, t('trafficOperation.lookupFailed')),
      );
      if (source) keyboard.requestFocus(source);
    } finally {
      lookupInFlight.current = false;
      if (requestId === lookupSequence.current) setLookupLoading(false);
    }
  };
  const selectVehicle = async (nextPlate: string) => {
    if (working || billBlocksInput || lookupInFlight.current || vehicleBusy) return;
    const requestId = ++lookupSequence.current;
    lookupInFlight.current = true;
    setLookupLoading(true); setError('');
    try {
      const details = await identity.lookup(nextPlate, '', '');
      if (requestId !== lookupSequence.current) return;
      if (numberOf(valueOf(details.info, 'MemberId')) !== numberOf(valueOf(carInfo ?? {}, 'MemberId'))) throw new TrafficOperationError();
      applyIdentity(details);
    } catch (cause) {
      if (requestId === lookupSequence.current) setError(operationError(cause, t('trafficOperation.lookupFailed')));
    } finally { lookupInFlight.current = false; if (requestId === lookupSequence.current) setLookupLoading(false); }
  };
  useEffect(() => {
    // A new camera event identifies the accepted plate; it never submits traffic.
    if (showCameras && latestDetection && plate && plate === normalizeIranianPlateValue(latestDetection.event.plateText)) void lookupCar(false, 'plate');
  }, [latestDetection]);
  const openVehicle = (editing: boolean) => {
    if (!canEditVehicle || !carInfo) return;
    setVehicleEditing(editing); setVehicleError('');
    setVehicleDraft({ plate: editing ? plate : '', name: editing ? String(valueOf(carInfo, 'CarName') ?? '') : '',
      carType: editing ? Number(carType) : 0, color: editing ? String(valueOf(carInfo, 'CarColor') ?? '') : '',
      model: editing ? String(valueOf(carInfo, 'CarModel') ?? '') : '' });
  };
  const saveVehicle = async (draft: VehicleDraft) => {
    if (!canEditVehicle || vehicleBusy || !carInfo) return;
    const requestId = ++lookupSequence.current;
    const memberId = numberOf(valueOf(carInfo, 'MemberId'));
    setVehicleBusy(true); setVehicleError('');
    try {
      const savedCarId = await identity.saveVehicle(memberId, draft);
      if (requestId !== lookupSequence.current) return;
      // The mutation is complete even if the follow-up lookup fails; do not offer a second save.
      setVehicleDraft(null);
      identity.setDetails(null); setCarInfo(null); setOperationMode('idle');
      setPlate(draft.plate); setCarType(String(draft.carType) as VehiclePlateType);
      setCardNumber(''); setMemberCode('');
      const details = await identity.lookup(draft.plate, '', '');
      if (requestId !== lookupSequence.current) return;
      if (numberOf(valueOf(details.info, 'CarId')) !== savedCarId || numberOf(valueOf(details.info, 'MemberId')) !== memberId) throw new TrafficOperationError();
      applyIdentity(details); setNotice(t('trafficIdentity.vehicleSaved'));
    } catch (cause) {
      if (requestId === lookupSequence.current) {
        const message = operationError(cause, t('trafficIdentity.vehicleSaveError'));
        setVehicleError(message); setError(message);
      }
    } finally { setVehicleBusy(false); }
  };
  const visibleRows = useMemo(() => rows, [rows]);
  const registerTraffic = async () => {
    setNotice('');
    if (
      !isValidIranianPlate(plate, carType) ||
      !entryDoorId ||
      (!showCameras && !entryDateTime)
    ) {
      setError(copy.required);
      return;
    }
    setWorking(true);
    setError("");
    try {
      if (showCameras) {
        if (!actionState.canEnter) throw new TrafficOperationError('', 'directionUnavailable');
        if (needsVehicle) throw new TrafficOperationError('', 'selectVehicle');
        await operations.enter({ parkingId, doorId: Number(entryDoorId), doorType: trafficDoor.door?.type, userId, plate, carType: Number(carType), info: carInfo ?? {} });
      } else trafficResult(await trafficApi.createManualDump({
        plate,
        parkingId,
        carType: Number(carType),
        enterDateTime: apiDateTime(entryDateTime),
        exitDateTime: apiDateTime(exitDateTime),
        doorId: Number(entryDoorId),
      }));
      setNotice(copy.saved);
      setPlate("");
      setCardNumber("");
      setMemberCode("");
      setEntryDateTime("");
      setExitDateTime("");
      clearLookup();
      keyboard.requestFocus('plate');
      await load();
    } catch (cause) {
      setError(operationError(cause, copy.saveError));
    } finally {
      setWorking(false);
    }
  };
  const selected = rows.find(
    (row) => numberOf(valueOf(row, "DumpId")) === selectedId,
  );
  const updateTraffic = async () => {
    if (!selected) return;
    setWorking(true);
    try {
      const currentSourceType = numberOf(valueOf(selected, "SourceType"));
      const nextSourceType =
        currentSourceType === 4
          ? 3
          : [0, 1, 2].includes(currentSourceType) &&
              !valueOf(selected, "ExitDateTime")
            ? 5
            : currentSourceType;
      await trafficApi.saveTraffic({
        Id: selectedId,
        CarPlate: valueOf(selected, "CarPlate"),
        SourceType: nextSourceType,
        EnterDateTime: apiDateTime(editEnter),
        ExitDateTime: apiDateTime(editExit),
      });
      setEditOpen(false);
      setNotice(copy.updated);
      await load();
    } catch {
      setError(copy.saveError);
    } finally {
      setWorking(false);
    }
  };
  const removeTraffic = async () => {
    if (!selectedId || !selected) return;
    const sourceTypeValue = numberOf(valueOf(selected, "SourceType"));
    const canDelete =
      sourceTypeValue === 3 ||
      (sourceTypeValue === 4 && !valueOf(selected, "ExitDateTime"));
    if (!canDelete) {
      setDeleteOpen(false);
      setError(
        isPersian
          ? "فقط رکوردهایی که ورود و خروجشان توسط کاربر ثبت شده باشد قابل حذف هستند."
          : "Only records manually registered for entry and exit can be deleted.",
      );
      return;
    }
    setWorking(true);
    try {
      await trafficApi.deleteTraffic(selectedId);
      setDeleteOpen(false);
      setNotice(copy.deleted);
      await load();
    } catch {
      setError(copy.saveError);
    } finally {
      setWorking(false);
    }
  };
  const openEdit = (row: TrafficRow) => {
    setSelectedId(numberOf(valueOf(row, "DumpId") ?? valueOf(row, "Id")));
    setEditEnter(inputDateTime(valueOf(row, "EnterDateTime")));
    setEditExit(inputDateTime(valueOf(row, "ExitDateTime")));
    setEditOpen(true);
  };
  const openDelete = (row: TrafficRow) => {
    setSelectedId(numberOf(valueOf(row, "DumpId") ?? valueOf(row, "Id")));
    setDeleteOpen(true);
  };
  const showTrafficPayment = (bill: RecordValue, source: TrafficPaymentSource) => {
    try {
      const policy = trafficPaymentPolicy(bill, source);
      setExitBill({ ...bill });
      setPaymentPresentation({ ...policy, door: trafficDoor.door ? { ...trafficDoor.door } : null });
      setPaymentError('');
      setBillOpen(true);
    } catch {
      setError(t('trafficPayment.invalidBill'));
    }
  };
  const openPay = (row: TrafficRow) => {
    if (billOpen) { paymentPaperRef.current?.focus(); return; }
    if (!hasTrafficTime(valueOf(row, "ExitDateTime"))) {
      setError(
        isPersian
          ? "ابتدا خروج خودرو را ثبت کنید."
          : "Register the vehicle exit first.",
      );
      return;
    }
    const payType = numberOf(valueOf(row, "PayType"));
    if (payType !== 0 && payType !== 9) {
      setError(
        isPersian
          ? "این تردد قبلاً پرداخت شده است."
          : "This traffic has already been paid.",
      );
      return;
    }
    setSelectedId(numberOf(valueOf(row, "DumpId") ?? valueOf(row, "Id")));
    showTrafficPayment(row, 'grid');
  };
  const openExit = async (row: TrafficRow) => {
    const requestId = ++lookupSequence.current;
    if (hasTrafficTime(valueOf(row, "ExitDateTime"))) {
      setError(
        isPersian
          ? "خروج خودرو قبلاً ثبت شده است."
          : "The vehicle exit is already registered.",
      );
      return;
    }
    const rowId = numberOf(valueOf(row, "DumpId") ?? valueOf(row, "Id"));
    const rowPlate = normalizeIranianPlateValue(
      String(
        valueOf(row, "AbsolutCarPlate") ??
          valueOf(row, "CarPlate") ??
          valueOf(row, "Plate") ??
          valueOf(row, "CarPlateReversed") ??
          "",
      ),
    );
    const rowCard = String(valueOf(row, "CardNumber") ?? "");
    const rowMember = String(valueOf(row, "MemberCode") ?? "");
    setSelectedId(rowId);
    setPlate(rowPlate);
    setCardNumber(rowCard);
    setMemberCode(rowMember);
    setCarInfo(row);
    identity.setDetails(null);
    setOperationMode("exit");
    setLookupLoading(true);
    setError("");
    try {
      if (showCameras) {
        const details = await identity.lookup(rowPlate, rowCard, rowMember);
        if (requestId !== lookupSequence.current) return;
        if (!hasOpenTraffic(details.info) || numberOf(valueOf(details.info, 'DumpId')) !== rowId) throw new TrafficOperationError();
        applyIdentity(details);
        return;
      }
      const info = await operations.lookup(
        parkingId,
        rowPlate,
        rowCard,
        rowMember,
      );
      if (requestId !== lookupSequence.current) return;
      if (!hasOpenTraffic(info) || numberOf(valueOf(info, 'DumpId')) !== rowId) throw new TrafficOperationError();
      if (info) {
        setCarInfo(info);
        setPlate(
          normalizeIranianPlateValue(
            String(
              valueOf(info, "Plate") ??
                valueOf(info, "CarPlate") ??
                valueOf(info, "AbsolutCarPlate") ??
                valueOf(info, "CarPlateReversed") ??
                rowPlate,
            ),
          ),
        );
        setCardNumber(String(valueOf(info, "CardNumber") ?? rowCard));
        setMemberCode(String(valueOf(info, "MemberCode") ?? rowMember));
      }
    } catch (cause) {
      if (requestId !== lookupSequence.current) return;
      setCarInfo(null);
      setOperationMode('idle');
      setError(cause instanceof TrafficOperationError && cause.userMessage ? cause.userMessage : t('trafficOperation.lookupFailed'));
    } finally {
      if (requestId === lookupSequence.current) setLookupLoading(false);
    }
  };
  const openCargo = async (row: TrafficRow, outbound = false) => {
    setSelectedId(numberOf(valueOf(row, "DumpId") ?? valueOf(row, "Id")));
    setCargoRow(row);
    setCargoOutbound(outbound);
    setCargoForm({
      driverId: "",
      merchandiseId: "",
      originId: "",
      destinationId: "",
      weight: "0",
      count: "0",
      reason: "",
      description: "",
    });
    setCargoOpen(true);
    setCargoError("");
    setCargoLoading(true);
    try {
      const response = await cargoApi.getRequiredData();
      const root =
        response && typeof response === "object"
          ? (response as Record<string, unknown>)
          : {};
      const values =
        root.Values ?? root.values ?? root.Data ?? root.data ?? response;
      const data =
        values && typeof values === "object" && !Array.isArray(values)
          ? (values as RecordValue)
          : {};
      setCargoDrivers(asRows(recordValue(data, "Drivers")));
      setCargoMerchandises(asRows(recordValue(data, "Merchandises")));
      setCargoCompanies(
        asRows(
          recordValue(data, "companyDetails") ??
            recordValue(data, "CompanyDetails"),
        ),
      );
    } catch {
      setCargoError(
        isPersian
          ? "اطلاعات ثبت بار دریافت نشد."
          : "Cargo information could not be loaded.",
      );
    } finally {
      setCargoLoading(false);
    }
  };
  const saveCargo = async () => {
    if (!cargoRow) return;
    const driver = cargoDrivers.find(
      (item) => String(valueOf(item, "Id")) === cargoForm.driverId,
    );
    const merchandise = cargoMerchandises.find(
      (item) => String(valueOf(item, "Id")) === cargoForm.merchandiseId,
    );
    const origin = cargoCompanies.find(
      (item) => String(valueOf(item, "SectionId")) === cargoForm.originId,
    );
    const destination = cargoCompanies.find(
      (item) => String(valueOf(item, "SectionId")) === cargoForm.destinationId,
    );
    if (
      !driver ||
      !merchandise ||
      !origin ||
      !destination ||
      cargoForm.originId === cargoForm.destinationId
    ) {
      setCargoError(
        isPersian
          ? "راننده، کالا، مبدا و مقصد را کامل و متفاوت انتخاب کنید."
          : "Select valid and different driver, merchandise, origin and destination.",
      );
      return;
    }
    setCargoLoading(true);
    setCargoError("");
    try {
      const dumpId = numberOf(valueOf(cargoRow, "DumpId"));
      const check = await cargoApi.isRegistered(dumpId, cargoOutbound);
      const checkRoot =
        check && typeof check === "object"
          ? (check as Record<string, unknown>)
          : {};
      if (Boolean(checkRoot.Values ?? checkRoot.values ?? checkRoot.Data)) {
        setCargoError(
          isPersian
            ? "برای این تردد قبلاً بار ثبت شده است."
            : "Cargo is already registered for this traffic.",
        );
        return;
      }
      await cargoApi.save({
        CargoIOsId: 0,
        IsOutBoundCargo: cargoOutbound,
        TrafficDumpId: dumpId,
        Plate: valueOf(cargoRow, "CarPlate"),
        cargoDrivers: driver,
        CargoMerchandises: merchandise,
        companyDetailsList: [
          { ...origin, IsOriginSection: true, IsDestinationSection: false },
          {
            ...destination,
            IsOriginSection: false,
            IsDestinationSection: true,
          },
        ],
        Weight: numberOf(cargoForm.weight),
        Count: numberOf(cargoForm.count),
        Resason: cargoForm.reason,
        Description: cargoForm.description,
      });
      setCargoOpen(false);
      setNotice(
        cargoOutbound
          ? isPersian
            ? "بار خروجی ثبت شد."
            : "Outbound cargo was registered."
          : isPersian
            ? "بار ورودی ثبت شد."
            : "Inbound cargo was registered.",
      );
      await load();
    } catch {
      setCargoError(
        isPersian ? "ثبت بار انجام نشد." : "Cargo registration failed.",
      );
    } finally {
      setCargoLoading(false);
    }
  };
  const clearLookup = () => {
    lookupSequence.current++;
    setLookupLoading(false);
    setCarInfo(null);
    setMemberCredit(null);
    setOperationMode("idle");
    identity.clear();
  };
  const registerExit = async () => {
    if (billOpen) { paymentPaperRef.current?.focus(); return; }
    setNotice('');
    const dumpId = numberOf(valueOf(carInfo ?? {}, "DumpId"));
    if (!dumpId || !entryDoorId) {
      setError(
        isPersian
          ? "تردد باز برای خروج پیدا نشد."
          : "No open traffic was found for exit.",
      );
      return;
    }
    setWorking(true);
    setError("");
    try {
      if (showCameras && !actionState.canExit) throw new TrafficOperationError('', 'directionUnavailable');
      const bill = await operations.exit({
        parkingId, doorId: Number(entryDoorId), doorType: showCameras ? trafficDoor.door?.type : undefined, userId, plate, carType: Number(carType), info: carInfo ?? {},
      }, apiDateTime(exitDateTime));
      clearLookup();
      setPlate('');
      setCardNumber('');
      setMemberCode('');
      setEntryDateTime('');
      setExitDateTime('');
      keyboard.requestFocus('plate');
      await load();
      // Exit countdown belongs to manual traffic, not the history editor.
      showTrafficPayment(bill, showCameras ? 'exit' : 'grid');
      setNotice(t('trafficOperation.exitSaved'));
    } catch (cause) {
      setError(
        operationError(cause, t('trafficOperation.exitFailed')),
      );
    } finally {
      setWorking(false);
    }
  };
  const settleCash = async () => {
    const dumpId = numberOf(valueOf(exitBill ?? {}, "DumpId"));
    if (!dumpId || !billOpen || !paymentPresentation || paymentPresentation.amount <= 0 || working || operations.pending) return;
    setNotice('');
    setPaymentError('');
    setWorking(true);
    setPaymentPending(true);
    try {
      await operations.pay(dumpId);
      setBillOpen(false);
      setExitBill(null);
      setPaymentPresentation(null);
      setNotice(
        isPersian ? "تسویه نقدی انجام شد." : "Cash settlement completed.",
      );
      clearLookup();
      setPlate("");
      setCardNumber("");
      setMemberCode("");
      setEntryDateTime("");
      setExitDateTime("");
      await load();
    } catch (cause) {
      setPaymentError(cause instanceof TrafficOperationError && cause.userMessage ? cause.userMessage : t('trafficOperation.paymentFailed'));
    } finally {
      setWorking(false);
      setPaymentPending(false);
    }
  };
  const closeTrafficPayment = () => {
    if (paymentPending) return;
    // Modeless timeout must not steal focus from the next vehicle being entered.
    if (paymentPaperRef.current?.contains(document.activeElement)) keyboard.requestFocus(carInfo ? 'actions' : 'plate');
    setBillOpen(false);
    setExitBill(null);
    setPaymentPresentation(null);
    setPaymentError('');
  };
  const handleOperation = () =>
    operationMode === "exit" ? void registerExit() : operationMode === 'enter' ? void registerTraffic() : void lookupCar();
  const actionButton = (
    label: string,
    icon: ReactNode,
    onClick: () => void,
  ) => (
    <IconButton
      size="small"
      color="primary"
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      sx={{ p: 0, width: 26, height: 26, display: "inline-flex" }}
    >
      {icon}
    </IconButton>
  );
  const selectedSourceType = selected
    ? numberOf(valueOf(selected, "SourceType"))
    : -1;
  const canEditEntry = selectedSourceType === 3 || selectedSourceType === 4;
  const canEditExit =
    selectedSourceType === 3 ||
    selectedSourceType === 5 ||
    Boolean(selected && !valueOf(selected, "ExitDateTime"));
  const recordColumns = [
    {
      key: "MemberCode",
      label: isPersian ? "کد عضویت" : "Member code",
      width: 155,
      minWidth: 155,
    },
    {
      key: "MemberFullName",
      label: isPersian ? "نام عضو" : "Member name",
      width: 150,
      minWidth: 150,
    },
    {
      key: "CarPlate",
      label: copy.plate,
      width: 155,
      minWidth: 155,
      getFilterValue: (row: TrafficRow) =>
        valueOf(row, "CarPlateReversed") ?? valueOf(row, "CarPlate"),
    },
    {
      key: "EnterDateTime",
      label: isPersian ? "ساعت و تاریخ ورود" : "Entry date and time",
      width: 155,
      minWidth: 155,
      render: (row: TrafficRow) =>
        dateTime(valueOf(row, "EnterDateTime"), isPersian),
    },
    {
      key: "ExitDateTime",
      label: isPersian ? "ساعت و تاریخ خروج" : "Exit date and time",
      width: 137,
      minWidth: 137,
      render: (row: TrafficRow) =>
        dateTime(valueOf(row, "ExitDateTime"), isPersian),
    },
    {
      key: "PayType",
      label: isPersian ? "وضعیت پرداخت" : "Payment status",
      width: 105,
      minWidth: 105,
      render: (row: TrafficRow) =>
        payTypeLabel(valueOf(row, "PayType"), isPersian),
    },
    {
      key: "CommonCost",
      label: isPersian ? "مبلغ پرداختی" : "Amount paid",
      width: 105,
      minWidth: 105,
    },
    {
      key: "CargoAction",
      label: "",
      width: 35,
      minWidth: 35,
      compact: true,
      filterable: false,
      render: (row: TrafficRow) =>
        actionButton(
          isPersian ? "ثبت بار" : "Register cargo",
          <LocalShippingRoundedIcon sx={{ fontSize: 17 }} />,
          () => void openCargo(row),
        ),
    },
    {
      key: "EditAction",
      label: "",
      width: 35,
      minWidth: 35,
      compact: true,
      filterable: false,
      render: (row: TrafficRow) =>
        actionButton(
          isPersian ? "اعمال خروج" : "Apply exit",
          <EditRoundedIcon sx={{ fontSize: 17 }} />,
          () => openEdit(row),
        ),
    },
    {
      key: "DeleteAction",
      label: "",
      width: 35,
      minWidth: 35,
      compact: true,
      filterable: false,
      render: (row: TrafficRow) =>
        actionButton(
          isPersian ? "حذف" : "Delete",
          <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />,
          () => openDelete(row),
        ),
    },
    {
      key: "RowIndicator",
      label: "",
      width: 24,
      minWidth: 24,
      compact: true,
      filterable: false,
      render: (row: TrafficRow) =>
        selectedId === numberOf(valueOf(row, "DumpId") ?? valueOf(row, "Id"))
          ? "↪"
          : "",
    },
  ];
  const doorSelector = (<>
    <FormControl
      size="small"
      sx={{
        minWidth: { xs: 150, sm: 190 },
        "& .MuiInputBase-root": { height: 32, fontSize: "0.78rem" },
        "& .MuiInputLabel-root": { fontSize: "0.78rem" },
        "& .MuiSelect-select": { py: 0.5 },
      }}
    >
      <InputLabel id={doorLabelId}>{copy.door}</InputLabel>
      <Select
        labelId={doorLabelId}
        label={copy.door}
        disabled={working || billBlocksInput || lookupLoading || vehicleBusy || Boolean(vehicleDraft)}
        value={entryDoorId}
        onChange={(event) => setEntryDoorId(event.target.value)}
      >
        {doors.map((door) => (
          <MenuItem key={door.id} value={String(door.id)}>
            {door.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    {showCameras && <Box className="traffic-door-type" role="status" aria-label={t('trafficLayout.doorType')}>
      <Typography component="span" variant="caption" color="text.secondary">{t('trafficLayout.doorType')}:</Typography>
      <Typography component="span" variant="caption" sx={{ fontWeight: 600 }}>
        {trafficDoor.loading ? t('trafficLayout.doorLoading') : trafficDoor.door ? t('trafficLayout.doorTypes', { returnObjects: true })[trafficDoor.door.type] : t('trafficLayout.doorUnknown')}
      </Typography>
    </Box>}
    </>
  );
  const operationTitle = showCameras ? t('trafficOperation.title') :
    operationMode === "exit"
      ? isPersian
        ? "ثبت خروج"
        : "Register exit"
      : operationMode === "enter"
        ? isPersian
          ? "ثبت ورود"
          : "Register entry"
        : isPersian
          ? "عملیات ورود و خروج"
          : "Entry and exit operation";
  const operationHint =
    operationMode === "exit"
      ? isPersian
        ? "برای خودرو تردد باز پیدا شد؛ زمان خروج را مشخص و مبلغ را محاسبه کنید."
        : "An open traffic was found; set the exit time and calculate the amount."
      : operationMode === "enter"
        ? isPersian
          ? "برای این شناسه تردد باز پیدا نشد؛ زمان ورود را ثبت کنید."
          : "No open traffic was found; register the entry time."
        : "";
  const policyAlerts = showCameras ? trafficAlerts(carInfo, actionState.direction === 'exit' ? 'exit' : 'enter', appConfig.trafficRequireExitPermission) : [];
  const needsVehicle = showCameras && operationMode === 'enter' && Boolean(carInfo) && numberOf(valueOf(carInfo ?? {}, 'MemberId')) > 0
    && !identity.details?.cars.some(car => car.Id === numberOf(valueOf(carInfo ?? {}, 'CarId')) && normalizeIranianPlateValue(car.Plate) === plate);
  const identityBusy = working || operations.pending || billBlocksInput || historyOpen || lookupLoading || vehicleBusy;
  const keyboard = useTrafficKeyboardNavigation(showCameras, entryDoorId, identityBusy || trafficDoor.loading || Boolean(vehicleDraft));
  const cancelTraffic = () => {
    clearLookup(); setPlate(''); setCardNumber(''); setMemberCode(''); setEntryDateTime(''); setExitDateTime('');
    setLatestDetection(null); setError(''); setNotice('');
    // Restore keyboard entry after React clears and re-enables the plate fields.
    keyboard.requestFocus('plate');
  };
  const closeHistory = () => {
    if (historyBusy) return;
    setHistoryOpen(false);
    void lookupCar(true);
    void doorTraffics.refresh();
  };

  const plateInput = (
    <Box ref={plateFieldRef} className="traffic-plate-field" onBlur={event => {
      if (showCameras && !event.currentTarget.contains(event.relatedTarget as Node | null) && keyboard.shouldIdentifyOnBlur()) void lookupCar(false, 'plate');
    }}>
      <IranianPlateInput
        label={copy.plate}
        value={plate}
        carType={carType}
        disabled={identityBusy || (showCameras && trafficDoor.loading)}
        onComplete={showCameras ? () => void lookupCar(false, 'plate') : undefined}
        onCarTypeChange={(value) => { clearLookup(); setCarType(value); }}
        onChange={(value) => {
          clearLookup();
          setPlate(value);
        }}
        error={Boolean(plate) && !isValidIranianPlate(plate, carType)}
        helperText={
          Boolean(plate) && !isValidIranianPlate(plate, carType)
            ? isPersian
              ? "قالب پلاک کامل نیست."
              : "Complete the plate format."
            : undefined
        }
      />
    </Box>
  );
  const cardMemberInputs = (
    <Box className="traffic-card-member-fields"
      onKeyDown={event => {
        if (showCameras && event.key === 'Enter') {
          event.preventDefault();
          void lookupCar(false, (event.target as HTMLElement).closest('.traffic-member-field') ? 'member' : 'card');
        }
      }}>
      <TextField
        size="small"
        className="traffic-card-field"
        label={copy.card}
        disabled={identityBusy || (showCameras && trafficDoor.loading)}
        value={cardNumber}
        onChange={(event) => {
          clearLookup();
          setCardNumber(event.target.value);
        }}
        onBlur={() => { if (keyboard.shouldIdentifyOnBlur()) void lookupCar(false, 'card'); }}
      />
      <TextField
        size="small"
        className="traffic-member-field"
        label={copy.memberCode}
        disabled={identityBusy || (showCameras && trafficDoor.loading)}
        value={memberCode}
        onChange={(event) => {
          clearLookup();
          setMemberCode(event.target.value);
        }}
        onBlur={() => { if (keyboard.shouldIdentifyOnBlur()) void lookupCar(false, 'member'); }}
      />
    </Box>
  );

  return (
    <ManagementWorkspaceFrame
      className={showCameras ? 'traffic-control-workspace' : undefined}
      title={title}
      pageTitle={pageTitle}
      language={language}
      loading={loading}
      onRefresh={() => { void load(); if (showCameras && trafficDoor.error) trafficDoor.refresh(); }}
      headingActions={doorSelector}
    >
      {showCameras && <AppToast message={error || notice} severity={error ? 'error' : 'success'} onClose={() => { setError(''); setNotice(''); }} />}
      {!showCameras && notice && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {notice}
        </Alert>
      )}
      {!showCameras && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box ref={topPanelRef} className="traffic-top-grid" style={showCameras && topHeight !== null ? { flexBasis: `clamp(248px, ${topHeight}px, calc(100% - 200px))` } : undefined}>
        <Box ref={keyboard.consoleRef} className={showCameras ? 'traffic-control-console' : 'traffic-history-console'}
          onKeyDownCapture={keyboard.onKeyDownCapture} onPointerDownCapture={keyboard.onPointerDownCapture}>
          <Tooltip
            title={isPersian ? "شناسایی خودرو" : "Vehicle identification"}
            placement="top"
            arrow
          >
            <Paper
              variant="outlined"
              className="traffic-entry-identity traffic-entry-panel"
              sx={{ p: 1.5 }}
            >
              <Box
                className="traffic-vehicle-identification-grid"
                onBlur={event => {
                  if (!showCameras && !event.currentTarget.contains(event.relatedTarget as Node | null)) void lookupCar();
                }}
              >
                {showCameras ? <>{plateInput}{cardMemberInputs}</> : <>{cardMemberInputs}{plateInput}</>}
                {lookupLoading && (
                  <Typography variant="caption" color="text.secondary">
                    {isPersian ? "در حال بررسی سوابق..." : "Checking history..."}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Tooltip>
          <Tooltip title={operationTitle} placement="top" arrow>
            <Paper
              variant="outlined"
              className={`traffic-entry-operation traffic-entry-panel traffic-operation-latest-panel ${showCameras ? "traffic-operation-tall" : ""}`}
              sx={{ p: 1.5 }}
            >
              <Box className="traffic-operation-latest-layout">
                <Box className="traffic-operation-content">
                  {showCameras && <Box className="traffic-operation-actions">
                    <TrafficOperationActions language={language} state={actionState}
                      busy={identityBusy || trafficDoor.loading} blocked={needsVehicle || policyAlerts.some(alert => alert.blocked)}
                      canSearch={canSearchHistory} canCancel={Boolean(plate || cardNumber || memberCode || carInfo || latestDetection)}
                      onEnter={() => void registerTraffic()} onExit={() => void registerExit()}
                      onSearch={() => { if (canSearchHistory && carInfo) setHistoryOpen(true); }} onCancel={cancelTraffic} />
                  </Box>}
                  <Box className="traffic-operation-information">
                    {!showCameras && operationHint && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1.5 }}
                      >
                        {operationHint}
                      </Typography>
                    )}
                    {!showCameras && <Box className="traffic-operation-details" aria-label={isPersian ? "مشخصات پلاک انتخاب‌شده" : "Selected plate details"}>
                      <Typography variant="body2" className="traffic-operation-detail-row">
                        <span>{isPersian ? "پلاک" : "Plate"}</span>
                        <strong dir="ltr">{plate || "—"}</strong>
                      </Typography>
                      {carInfo && (
                        <>
                          <Typography variant="body2" className="traffic-operation-detail-row">
                            <span>{isPersian ? "عضو" : "Member"}</span>
                            <strong>{String(valueOf(carInfo, "MemberFullName") ?? valueOf(carInfo, "Name") ?? "—")}</strong>
                          </Typography>
                          <Typography variant="body2" className="traffic-operation-detail-row">
                            <span>{isPersian ? "کد عضویت" : "Member code"}</span>
                            <strong>{String(valueOf(carInfo, "MemberCode") ?? "—")}</strong>
                          </Typography>
                          <Typography variant="body2" className="traffic-operation-detail-row">
                            <span>{isPersian ? "خودرو" : "Vehicle"}</span>
                            <strong>{String(valueOf(carInfo, "CarName") ?? valueOf(carInfo, "CarModel") ?? "—")}</strong>
                          </Typography>
                          <Typography variant="body2" className="traffic-operation-detail-row">
                            <span>{isPersian ? "رنگ" : "Color"}</span>
                            <strong>{String(valueOf(carInfo, "CarColor") ?? "—")}</strong>
                          </Typography>
                          <Typography variant="body2" className="traffic-operation-detail-row">
                            <span>{isPersian ? "تردد باز" : "Open traffic"}</span>
                            <strong dir="ltr">{dateTime(valueOf(carInfo, "EnterDateTime"), isPersian)}</strong>
                          </Typography>
                          <Typography variant="body2" className="traffic-operation-detail-row">
                            <span>{isPersian ? "تعرفه" : "Tariff"}</span>
                            <strong>{String(valueOf(carInfo, "MemberTariffName") ?? valueOf(carInfo, "TariffName") ?? valueOf(carInfo, "TarrifTitle") ?? "—")}</strong>
                          </Typography>
                          {!showCameras && <Typography variant="body2" className="traffic-operation-detail-row">
                            <span>{isPersian ? "اعتبار" : "Credit"}</span>
                            <strong>{String(valueOf(memberCredit ?? {}, "Credit") ?? valueOf(memberCredit ?? {}, "CurrentCredit") ?? valueOf(carInfo, "CashAmount") ?? "—")}</strong>
                          </Typography>}
                        </>
                      )}
                    </Box>}
                    {showCameras && !identity.details && <Typography variant="body2" color="text.secondary">{t('trafficIdentity.identifyHint')}</Typography>}
                    {showCameras && identity.details && <TrafficIdentitySummary details={identity.details} language={language}
                      onAutomaticClose={() => keyboard.requestFocus(needsVehicle ? 'vehicle' : 'actions')}
                      busy={identityBusy} canEdit={canEditVehicle} onSelect={nextPlate => void selectVehicle(nextPlate)}
                      onAdd={() => openVehicle(false)} onEdit={() => openVehicle(true)} onRetry={() => void lookupCar(true)} />}
                    {policyAlerts.map(alert => <Alert key={alert.key} severity={alert.blocked ? 'error' : 'warning'}>
                      {t(`trafficIdentity.${alert.key}`)}{alert.description ? ` — ${alert.description}` : ''}
                    </Alert>)}
                    {showCameras && trafficDoor.error && <Alert severity="error">{t('trafficIdentity.doorError')}</Alert>}
                    {showCameras && carInfo && actionState.direction === 'exit' && !actionState.canExit && <Alert severity="warning">{t('trafficIdentity.noEntry')}</Alert>}
                    {showCameras && carInfo && actionState.direction === 'enter' && !actionState.canEnter && <Alert severity="warning">{t('trafficIdentity.alreadyEntered')}</Alert>}
                  </Box>
                  {!showCameras && <Box className="traffic-operation-actions">
                    {operationMode === "exit" && (
                      <Typography variant="body2" sx={{ mb: 1.5 }}>
                        {isPersian ? "زمان ورود: " : "Entry time: "}
                        <strong>
                          {dateTime(
                            valueOf(carInfo ?? {}, "EnterDateTime"),
                            isPersian,
                          )}
                        </strong>
                      </Typography>
                    )}
                    {operationMode === "enter" && (
                      <EosDateTimePicker
                        language={language}
                        label={copy.entry}
                        value={entryDateTime}
                        onChange={setEntryDateTime}
                      />
                    )}
                    {operationMode === "exit" && (
                      <EosDateTimePicker
                        language={language}
                        label={copy.exit}
                        value={exitDateTime}
                        onChange={setExitDateTime}
                      />
                    )}
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleOperation}
                      disabled={identityBusy || !entryDoorId || (!plate && !cardNumber && !memberCode) || needsVehicle || policyAlerts.some(alert => alert.blocked)}
                    >
                      {operationMode === "exit"
                        ? (isPersian ? "محاسبه مبلغ و ثبت خروج" : "Calculate amount and register exit")
                        : operationMode === "enter"
                          ? (isPersian ? "ثبت ورود" : "Register entry")
                          : t('trafficOperation.lookup')}
                    </Button>
                  </Box>}
                </Box>
              </Box>
            </Paper>
          </Tooltip>
        </Box>
        {showCameras && (
          <Box className="traffic-control-camera-column">
            <TrafficCameraPanels
              doorId={entryDoorId}
              language={language}
              onDetection={handleDetection}
            />
            <TrafficDetectionPanel detection={latestDetection} language={language} />
          </Box>
        )}
      </Box>
      {showCameras && <TrafficWorkspaceSplitter panelRef={topPanelRef} onResize={setTopHeight} language={language} />}
      {showCameras ? (
        <TrafficControlGrids key={`${parkingId}:${entryDoorId}`} rows={rows} language={language}
          loading={doorTraffics.loading} error={doorTraffics.error} updatedAt={doorTraffics.updatedAt}
           busy={identityBusy || cargoLoading || Boolean(vehicleDraft)}
          onExit={(row) => void openExit(row)} onPay={openPay}
          onCargo={(row, outbound) => void openCargo(row, outbound)} />
      ) : <Box className="traffic-details-section traffic-records-grid">
        <ResourceState
          loading={loading}
          error=""
          empty={visibleRows.length === 0}
          loadingLabel={copy.loading}
          emptyLabel={copy.empty}
        >
          <AppDataGrid<TrafficRow>
            direction={isPersian ? "rtl" : "ltr"}
            rows={visibleRows}
            columns={recordColumns}
            filterable={Boolean(initialIdentity)}
            rowKey={(row) =>
              String(valueOf(row, "DumpId") ?? valueOf(row, "Id"))
            }
            selectedKey={selectedId}
            onRowClick={(row) =>
              setSelectedId(
                numberOf(valueOf(row, "DumpId") ?? valueOf(row, "Id")),
              )
            }
            onRowDoubleClick={(row) => openEdit(row)}
          />
        </ResourceState>
      </Box>}
      {showCameras && <TrafficVehicleDialog draft={vehicleDraft} editing={vehicleEditing} language={language} busy={vehicleBusy}
        error={vehicleError} onClose={() => setVehicleDraft(null)} onSave={draft => void saveVehicle(draft)} />}
      {showCameras && historyOpen && carInfo && <AppPopup open title={t('homeMenu.items.traffic-records')}
        onClose={closeHistory} busy={historyBusy} maxWidth="xl" cancelLabel={t('trafficIdentity.close')}>
        <TrafficRecordsWorkspace title={t('trafficOperation.search')} parkingId={parkingId} language={language}
          initialIdentity={{ plate, card: cardNumber, member: memberCode, doorId: entryDoorId }} onBusyChange={setHistoryBusy} />
      </AppPopup>}
      <AppPopup dir={isPersian ? "rtl" : "ltr"} open={cargoOpen} onClose={() => {
          if (!cargoLoading) setCargoOpen(false);
        }} maxWidth="md" busy={cargoLoading} title={cargoOutbound
            ? isPersian
              ? "ثبت بار خروجی"
              : "Register outbound cargo"
            : isPersian
              ? "ثبت بار ورودی"
              : "Register inbound cargo"} actions={[
  { id: 'action-0', label: copy.cancel, onClick: () => setCargoOpen(false), disabled: cargoLoading },
  { id: 'action-1', label: isPersian ? "ثبت بار" : "Register cargo", variant: "contained", onClick: () => void saveCargo(), disabled: cargoLoading }
]}>
          {cargoError && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {cargoError}
            </Alert>
          )}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
              pt: 1,
            }}
          >
            <FormControl size="small">
              <InputLabel>
                {isPersian ? "نوع بار" : "Cargo direction"}
              </InputLabel>
              <Select
                label={isPersian ? "نوع بار" : "Cargo direction"}
                value={cargoOutbound ? "out" : "in"}
                onChange={(event) =>
                  setCargoOutbound(event.target.value === "out")
                }
              >
                <MenuItem value="in">
                  {isPersian ? "بار ورودی" : "Inbound"}
                </MenuItem>
                <MenuItem value="out">
                  {isPersian ? "بار خروجی" : "Outbound"}
                </MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>{isPersian ? "راننده" : "Driver"}</InputLabel>
              <Select
                label={isPersian ? "راننده" : "Driver"}
                value={cargoForm.driverId}
                onChange={(event) =>
                  setCargoForm((current) => ({
                    ...current,
                    driverId: event.target.value,
                  }))
                }
              >
                {cargoDrivers.map((item) => (
                  <MenuItem
                    key={String(valueOf(item, "Id"))}
                    value={String(valueOf(item, "Id"))}
                  >
                    {String(
                      valueOf(item, "FullName") ??
                        `${valueOf(item, "FirstName") ?? ""} ${valueOf(item, "LastName") ?? ""}`,
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>{isPersian ? "کالا" : "Merchandise"}</InputLabel>
              <Select
                label={isPersian ? "کالا" : "Merchandise"}
                value={cargoForm.merchandiseId}
                onChange={(event) =>
                  setCargoForm((current) => ({
                    ...current,
                    merchandiseId: event.target.value,
                  }))
                }
              >
                {cargoMerchandises.map((item) => (
                  <MenuItem
                    key={String(valueOf(item, "Id"))}
                    value={String(valueOf(item, "Id"))}
                  >
                    {String(
                      valueOf(item, "MerchandiseTitle") ??
                        valueOf(item, "Title") ??
                        "",
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>{isPersian ? "مبدا" : "Origin"}</InputLabel>
              <Select
                label={isPersian ? "مبدا" : "Origin"}
                value={cargoForm.originId}
                onChange={(event) =>
                  setCargoForm((current) => ({
                    ...current,
                    originId: event.target.value,
                  }))
                }
              >
                {cargoCompanies.map((item) => (
                  <MenuItem
                    key={`origin-${String(valueOf(item, "SectionId"))}`}
                    value={String(valueOf(item, "SectionId"))}
                  >
                    {String(valueOf(item, "CompanyName") ?? "")} -{" "}
                    {String(valueOf(item, "SectionName") ?? "")}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>{isPersian ? "مقصد" : "Destination"}</InputLabel>
              <Select
                label={isPersian ? "مقصد" : "Destination"}
                value={cargoForm.destinationId}
                onChange={(event) =>
                  setCargoForm((current) => ({
                    ...current,
                    destinationId: event.target.value,
                  }))
                }
              >
                {cargoCompanies.map((item) => (
                  <MenuItem
                    key={`destination-${String(valueOf(item, "SectionId"))}`}
                    value={String(valueOf(item, "SectionId"))}
                  >
                    {String(valueOf(item, "CompanyName") ?? "")} -{" "}
                    {String(valueOf(item, "SectionName") ?? "")}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              type="number"
              label={isPersian ? "وزن" : "Weight"}
              value={cargoForm.weight}
              onChange={(event) =>
                setCargoForm((current) => ({
                  ...current,
                  weight: event.target.value,
                }))
              }
            />
            <TextField
              size="small"
              type="number"
              label={isPersian ? "تعداد" : "Count"}
              value={cargoForm.count}
              onChange={(event) =>
                setCargoForm((current) => ({
                  ...current,
                  count: event.target.value,
                }))
              }
            />
            <TextField
              size="small"
              label={isPersian ? "علت" : "Reason"}
              value={cargoForm.reason}
              onChange={(event) =>
                setCargoForm((current) => ({
                  ...current,
                  reason: event.target.value,
                }))
              }
            />
            <TextField
              size="small"
              multiline
              minRows={2}
              label={isPersian ? "توضیحات" : "Description"}
              value={cargoForm.description}
              onChange={(event) =>
                setCargoForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </Box>
        </AppPopup>
      <AppPopup dir={isPersian ? "rtl" : "ltr"} open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" busy={working} title={copy.editTitle} actions={[
  { id: 'action-0', label: copy.cancel, onClick: () => setEditOpen(false) },
  { id: 'action-1', label: copy.register, variant: "contained", onClick: () => void updateTraffic(), disabled: working }
]}>
          <EosDateTimePicker
            language={language}
            label={copy.entry}
            value={editEnter}
            onChange={setEditEnter}
            disabled={!canEditEntry}
            sx={{ mt: 1 }}
          />
          <EosDateTimePicker
            language={language}
            label={copy.exit}
            value={editExit}
            onChange={setEditExit}
            disabled={!canEditExit}
            sx={{ mt: 2 }}
          />
        </AppPopup>
      <ConfirmDialog
        open={deleteOpen}
        title={copy.remove}
        message={copy.deleteConfirm}
        cancelLabel={copy.cancel}
        confirmLabel={copy.remove}
        busy={working}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => void removeTraffic()}
      />
      {billOpen && exitBill && paymentPresentation && <TrafficPaymentPopup
        key={String(valueOf(exitBill, 'DumpId'))} bill={exitBill} presentation={paymentPresentation}
        language={language} busy={paymentPending} error={paymentError} paperRef={paymentPaperRef}
        onClose={closeTrafficPayment} onPay={() => void settleCash()} />}
    </ManagementWorkspaceFrame>
  );
}
