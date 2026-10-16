import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
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
}: Props) {
  const isPersian = language === "fa";
  const [doors, setDoors] = useState<Option[]>([]);
  const [rows, setRows] = useState<TrafficRow[]>([]);
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
  const [plate, setPlate] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [memberCode, setMemberCode] = useState("");
  const [carType, setCarType] = useState<VehiclePlateType>("0");
  const [entryDoorId, setEntryDoorId] = useState("");
  const [entryDateTime, setEntryDateTime] = useState("");
  const [exitDateTime, setExitDateTime] = useState("");
  const [carInfo, setCarInfo] = useState<RecordValue | null>(null);
  const [memberCredit, setMemberCredit] = useState<RecordValue | null>(null);
  const [operationMode, setOperationMode] = useState<OperationMode>("idle");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [exitBill, setExitBill] = useState<RecordValue | null>(null);
  const [billOpen, setBillOpen] = useState(false);
  const [latestDetection, setLatestDetection] = useState<{
    event: HshDetectionEvent;
    fullFrameUrl: string | null;
    plateImageUrl: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const handleDetection = useCallback<HshDetectionHandler>(async (event, loadArtifact) => {
    const nextPlate = normalizeIranianPlateValue(event.plateText);
    const [fullFrameUrl, plateImageUrl] = await Promise.all([
      loadArtifact("FullFrameRaw").catch(() => null),
      loadArtifact("PlateCrop").catch(() => null),
    ]);
    setLatestDetection((previous) => ({ event, fullFrameUrl, plateImageUrl }));
    if (nextPlate) setPlate(nextPlate);
    setCarInfo(null);
    setMemberCredit(null);
    setExitBill(null);
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
  }, [entryDoorId]);
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
        setEntryDoorId(String(next[0]?.id ?? ""));
      })
      .catch(() => setError(copy.loadError));
  }, [parkingId]);
  const load = async () => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      if (showCameras && !entryDoorId) {
        setRows([]);
        return;
      }
      const response = showCameras
        ? await trafficApi.getTraffics(Number(entryDoorId))
        : await trafficApi.getAllTraffics({
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
    void load();
  }, [parkingId, showCameras, showCameras ? entryDoorId : ""]);
  const lookupCar = async () => {
    if (!plate && !cardNumber && !memberCode) return;
    setLookupLoading(true);
    setError("");
    try {
      const response = await trafficApi.getCarTrafficInfo(
        parkingId,
        plate,
        cardNumber,
        memberCode,
      );
      const root =
        response && typeof response === "object"
          ? (response as Record<string, unknown>)
          : {};
      const values =
        root.Values ?? root.values ?? root.Data ?? root.data ?? response;
      const info = Array.isArray(values)
        ? (values[0] as RecordValue | undefined)
        : values && typeof values === "object"
          ? (values as RecordValue)
          : null;
      if (info) {
        setCarInfo(info);
        setPlate(String(valueOf(info, "Plate") ?? plate));
        setCardNumber(String(valueOf(info, "CardNumber") ?? cardNumber));
        setMemberCode(String(valueOf(info, "MemberCode") ?? memberCode));
        const hasOpenEntry =
          Boolean(valueOf(info, "EnterDateTime")) &&
          numberOf(valueOf(info, "DumpId")) > 0 &&
          !valueOf(info, "ExitDateTime");
        setOperationMode(hasOpenEntry ? "exit" : "enter");
        const memberId = numberOf(valueOf(info, "MemberId"));
        if (memberId > 0) {
          const creditResponse =
            await trafficApi.getMemberCurrentCreditInfo(memberId);
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
    } catch {
      setOperationMode("enter");
      setError(
        isPersian ? "استعلام خودرو انجام نشد." : "Vehicle lookup failed.",
      );
    } finally {
      setLookupLoading(false);
    }
  };
  const visibleRows = useMemo(() => rows, [rows]);
  const registerTraffic = async () => {
    if (
      !isValidIranianPlate(plate, carType) ||
      !entryDoorId ||
      !entryDateTime
    ) {
      setError(copy.required);
      return;
    }
    setWorking(true);
    setError("");
    try {
      await trafficApi.createManualDump({
        plate,
        parkingId,
        carType: Number(carType),
        enterDateTime: apiDateTime(entryDateTime),
        exitDateTime: apiDateTime(exitDateTime),
        doorId: Number(entryDoorId),
      });
      setNotice(copy.saved);
      setPlate("");
      setCardNumber("");
      setMemberCode("");
      setEntryDateTime("");
      setExitDateTime("");
      setCarInfo(null);
      setMemberCredit(null);
      setOperationMode("idle");
      await load();
    } catch {
      setError(copy.saveError);
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
  const openPay = (row: TrafficRow) => {
    if (!valueOf(row, "ExitDateTime")) {
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
    setExitBill(row);
    setBillOpen(true);
  };
  const openExit = async (row: TrafficRow) => {
    if (valueOf(row, "ExitDateTime")) {
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
    setOperationMode("exit");
    setLookupLoading(true);
    setError("");
    try {
      const response = await trafficApi.getCarTrafficInfo(
        parkingId,
        rowPlate,
        rowCard,
        rowMember,
      );
      const root =
        response && typeof response === "object"
          ? (response as Record<string, unknown>)
          : {};
      const values =
        root.Values ?? root.values ?? root.Data ?? root.data ?? response;
      const info = Array.isArray(values)
        ? (values[0] as RecordValue | undefined)
        : values && typeof values === "object"
          ? (values as RecordValue)
          : null;
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
      } else setCarInfo(row);
    } catch {
      setCarInfo(row);
    } finally {
      setLookupLoading(false);
    }
  };
  const openCargo = async (row: TrafficRow) => {
    setSelectedId(numberOf(valueOf(row, "DumpId") ?? valueOf(row, "Id")));
    setCargoRow(row);
    setCargoOutbound(false);
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
    setCarInfo(null);
    setMemberCredit(null);
    setExitBill(null);
    setOperationMode("idle");
  };
  const previewExit = async () => {
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
      const response = await trafficApi.doExitDump({
        Id: dumpId,
        DoorId: Number(entryDoorId),
        ExitDoorId: Number(entryDoorId),
        CarId: numberOf(valueOf(carInfo ?? {}, "CarId")),
        MemberId: numberOf(valueOf(carInfo ?? {}, "MemberId")),
        CardId: numberOf(valueOf(carInfo ?? {}, "CardId")),
        TariffId: numberOf(valueOf(carInfo ?? {}, "MemberTariffId")),
        CarPlate: plate,
        CarType: Number(carType),
        EnterDateTime: valueOf(carInfo ?? {}, "EnterDateTime"),
        ExitDateTime: apiDateTime(exitDateTime) ?? new Date().toISOString(),
        DoSave: false,
      });
      const root =
        response && typeof response === "object"
          ? (response as Record<string, unknown>)
          : {};
      const values =
        root.Values ?? root.values ?? root.Data ?? root.data ?? response;
      const bill = Array.isArray(values)
        ? ((values[0] as RecordValue | undefined) ?? null)
        : values && typeof values === "object"
          ? (values as RecordValue)
          : null;
      if (!bill) throw new Error("Exit bill is empty.");
      setExitBill(bill);
      setBillOpen(true);
    } catch {
      setError(
        isPersian
          ? "محاسبه مبلغ خروج انجام نشد."
          : "Exit amount could not be calculated.",
      );
    } finally {
      setWorking(false);
    }
  };
  const settleCash = async () => {
    const dumpId = numberOf(valueOf(exitBill ?? {}, "DumpId"));
    if (!dumpId) return;
    setWorking(true);
    try {
      await trafficApi.payDump(dumpId, 1);
      setBillOpen(false);
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
    } catch {
      setError(isPersian ? "تسویه انجام نشد." : "Settlement failed.");
    } finally {
      setWorking(false);
    }
  };
  const handleOperation = () =>
    operationMode === "exit" ? void previewExit() : void registerTraffic();
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
  const controlActionColumn = {
    key: "Actions",
    label: isPersian ? "عملیات" : "Operations",
    width: 88,
    minWidth: 88,
    filterable: false,
    render: (row: TrafficRow) => (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.25,
          whiteSpace: "nowrap",
        }}
      >
        {actionButton(
          isPersian ? "پرداخت مبلغ خروج" : "Pay exit amount",
          <PaymentsRoundedIcon sx={{ fontSize: 18 }} />,
          () => openPay(row),
        )}
        {actionButton(
          isPersian ? "ثبت خروج" : "Register exit",
          <ExitToAppRoundedIcon sx={{ fontSize: 18 }} />,
          () => void openExit(row),
        )}
        {actionButton(
          isPersian ? "ثبت بار" : "Register cargo",
          <LocalShippingRoundedIcon sx={{ fontSize: 18 }} />,
          () => void openCargo(row),
        )}
      </Box>
    ),
  };
  const controlColumns = [
    {
      key: "MemberCode",
      label: isPersian ? "کد عضویت" : "Member code",
      width: 81,
      minWidth: 81,
    },
    {
      key: "CarPlate",
      label: copy.plate,
      width: 99,
      minWidth: 99,
      render: (row: TrafficRow) =>
        valueOf(row, "CarPlateReversed") ?? valueOf(row, "CarPlate") ?? "—",
    },
    {
      key: "CardNumber",
      label: isPersian ? "شماره کارت" : "Card number",
      width: 67,
      minWidth: 67,
    },
    {
      key: "EnterDateTime",
      label: isPersian ? "زمان ورود" : "Entry time",
      width: 95,
      minWidth: 95,
      render: (row: TrafficRow) =>
        dateTime(valueOf(row, "EnterDateTime"), isPersian),
    },
    {
      key: "ExitDateTime",
      label: isPersian ? "زمان خروج" : "Exit time",
      width: 91,
      minWidth: 91,
      render: (row: TrafficRow) =>
        dateTime(valueOf(row, "ExitDateTime"), isPersian),
    },
    {
      key: "PayType",
      label: isPersian ? "وضعیت پرداخت" : "Payment status",
      width: 93,
      minWidth: 93,
      render: (row: TrafficRow) =>
        payTypeLabel(valueOf(row, "PayType"), isPersian),
    },
    controlActionColumn,
  ];
  const columns = showCameras ? controlColumns : recordColumns;
  const doorSelector = (
    <FormControl
      size="small"
      sx={{
        minWidth: { xs: 150, sm: 190 },
        "& .MuiInputBase-root": { height: 32, fontSize: "0.78rem" },
        "& .MuiInputLabel-root": { fontSize: "0.78rem" },
        "& .MuiSelect-select": { py: 0.5 },
      }}
    >
      <InputLabel>{copy.door}</InputLabel>
      <Select
        label={copy.door}
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
  );
  const operationTitle =
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
  const billValue = (key: string, fallback = "—") =>
    String(valueOf(exitBill ?? {}, key) ?? fallback);

  return (
    <ManagementWorkspaceFrame
      title={title}
      pageTitle={pageTitle}
      language={language}
      loading={loading}
      onRefresh={() => void load()}
      headingActions={doorSelector}
    >
      {notice && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {notice}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box className="traffic-top-grid">
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
              onBlur={(event) => {
                if (
                  !event.currentTarget.contains(
                    event.relatedTarget as Node | null,
                  )
                )
                  void lookupCar();
              }}
            >
              <Box className="traffic-card-member-fields">
                <TextField
                  size="small"
                  className="traffic-card-field"
                  label={copy.card}
                  value={cardNumber}
                  onChange={(event) => {
                    clearLookup();
                    setCardNumber(event.target.value);
                  }}
                  onBlur={() => void lookupCar()}
                />
                <TextField
                  size="small"
                  className="traffic-member-field"
                  label={copy.memberCode}
                  value={memberCode}
                  onChange={(event) => {
                    clearLookup();
                    setMemberCode(event.target.value);
                  }}
                  onBlur={() => void lookupCar()}
                />
              </Box>
              <Box className="traffic-plate-field">
                <IranianPlateInput
                  label={copy.plate}
                  value={plate}
                  carType={carType}
                  onCarTypeChange={setCarType}
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
                {operationHint && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5 }}
                  >
                    {operationHint}
                  </Typography>
                )}
                <Box className="traffic-operation-details" aria-label={isPersian ? "مشخصات پلاک انتخاب‌شده" : "Selected plate details"}>
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
                      <Typography variant="body2" className="traffic-operation-detail-row">
                        <span>{isPersian ? "اعتبار" : "Credit"}</span>
                        <strong>{String(valueOf(memberCredit ?? {}, "Credit") ?? valueOf(memberCredit ?? {}, "CurrentCredit") ?? valueOf(carInfo, "CashAmount") ?? "—")}</strong>
                      </Typography>
                    </>
                  )}
                </Box>
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
                  disabled={working || lookupLoading || operationMode === "idle"}
                >
                  {operationMode === "exit"
                    ? (isPersian ? "محاسبه مبلغ و ثبت خروج" : "Calculate amount and register exit")
                    : operationMode === "enter"
                      ? (isPersian ? "ثبت ورود" : "Register entry")
                      : copy.register}
                </Button>
              </Box>
              {showCameras && (
                <Tooltip
                  title={isPersian ? "آخرین تردد" : "Latest traffic"}
                  placement="top"
                  arrow
                >
                  <Box className="traffic-last-traffic-inline">
                    {latestDetection ? (
                      <>
                        <Typography variant="body2" className="traffic-latest-detail-row">
                          <span>{isPersian ? "تاریخ و ساعت" : "Date and time"}</span>
                          <strong dir="ltr">{dateTime(latestDetection.event.occurredAtUtc, isPersian)}</strong>
                        </Typography>
                        <Typography variant="body2" className="traffic-latest-detail-row">
                          <span>{isPersian ? "پلاک" : "Plate"}</span>
                          <strong dir="ltr">{latestDetection.event.plateText || "—"}</strong>
                        </Typography>
                        <Box className="traffic-latest-image-stack">
                          <Box className="traffic-plate-preview">
                            {latestDetection.plateImageUrl ? (
                              <Box
                                component="img"
                                src={latestDetection.plateImageUrl}
                                alt={isPersian ? "تصویر پلاک آخرین تشخیص" : "Latest plate crop"}
                              />
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                {isPersian ? "تصویر پلاک موجود نیست" : "Plate image unavailable"}
                              </Typography>
                            )}
                          </Box>
                          <Box className="traffic-fullframe-preview">
                            {latestDetection.fullFrameUrl ? (
                              <Box
                                component="img"
                                src={latestDetection.fullFrameUrl}
                                alt={isPersian ? "تصویر کامل آخرین تشخیص پلاک" : "Latest full-frame detection"}
                              />
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                {isPersian ? "تصویر Full Frame موجود نیست" : "Full-frame image unavailable"}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </>
                    ) : (
                      <Box className="traffic-last-traffic-placeholder">
                        <Typography variant="body2" color="text.secondary">
                          {isPersian
                            ? "تصویر آخرین تشخیص در دسترس نیست"
                            : "Latest detection image is unavailable"}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Tooltip>
              )}
            </Box>
          </Paper>
        </Tooltip>
        {showCameras && (
          <TrafficCameraPanels
            doorId={entryDoorId}
            language={language}
            onDetection={handleDetection}
          />
        )}
      </Box>
      <Box
        className={`traffic-details-section ${showCameras ? "traffic-control-grid" : "traffic-records-grid"}`}
      >
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
            columns={columns}
            filterable={false}
            rowKey={(row) =>
              String(valueOf(row, "DumpId") ?? valueOf(row, "Id"))
            }
            selectedKey={selectedId}
            onRowClick={(row) =>
              setSelectedId(
                numberOf(valueOf(row, "DumpId") ?? valueOf(row, "Id")),
              )
            }
          />
        </ResourceState>
      </Box>
      <Dialog
        open={cargoOpen}
        onClose={() => {
          if (!cargoLoading) setCargoOpen(false);
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {cargoOutbound
            ? isPersian
              ? "ثبت بار خروجی"
              : "Register outbound cargo"
            : isPersian
              ? "ثبت بار ورودی"
              : "Register inbound cargo"}
        </DialogTitle>
        <DialogContent>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCargoOpen(false)} disabled={cargoLoading}>
            {copy.cancel}
          </Button>
          <Button
            variant="contained"
            onClick={() => void saveCargo()}
            disabled={cargoLoading}
          >
            {isPersian ? "ثبت بار" : "Register cargo"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{copy.editTitle}</DialogTitle>
        <DialogContent>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>{copy.cancel}</Button>
          <Button
            variant="contained"
            onClick={() => void updateTraffic()}
            disabled={working}
          >
            {copy.register}
          </Button>
        </DialogActions>
      </Dialog>
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
      <Dialog
        open={billOpen}
        onClose={() => setBillOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{isPersian ? "صورتحساب خروج" : "Exit bill"}</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
              pt: 1,
            }}
          >
            <Typography variant="body2">
              {isPersian ? "پلاک: " : "Plate: "}
              <strong>{billValue("CarPlate", plate)}</strong>
            </Typography>
            <Typography variant="body2">
              {isPersian ? "زمان ورود: " : "Entry: "}
              <strong>
                {dateTime(valueOf(exitBill ?? {}, "EnterDateTime"), isPersian)}
              </strong>
            </Typography>
            <Typography variant="body2">
              {isPersian ? "زمان خروج: " : "Exit: "}
              <strong>
                {dateTime(valueOf(exitBill ?? {}, "ExitDateTime"), isPersian)}
              </strong>
            </Typography>
            <Typography variant="body2">
              {isPersian ? "مدت توقف: " : "Duration: "}
              <strong>{billValue("TotalDuration")}</strong>
            </Typography>
            <Typography variant="body2">
              {isPersian ? "هزینه عضویت: " : "Member cost: "}
              <strong>{billValue("MemberCost", "0")}</strong>
            </Typography>
            <Typography variant="body2">
              {isPersian ? "هزینه پارکینگ: " : "Parking cost: "}
              <strong>{billValue("CommonCost", "0")}</strong>
            </Typography>
            <Typography variant="body2" sx={{ gridColumn: { sm: "1 / -1" } }}>
              {isPersian ? "مبلغ قابل پرداخت: " : "Amount due: "}
              <strong>
                {billValue("TotalCost", billValue("Amount", "0"))}
              </strong>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBillOpen(false)}>{copy.cancel}</Button>
          <Button
            variant="contained"
            onClick={() => void settleCash()}
            disabled={working || !numberOf(valueOf(exitBill ?? {}, "DumpId"))}
          >
            {isPersian ? "تسویه نقدی" : "Cash settlement"}
          </Button>
        </DialogActions>
      </Dialog>
    </ManagementWorkspaceFrame>
  );
}
