import type { TrafficIdentity } from './trafficIdentityService';
import { TrafficHistoryWorkspace } from './TrafficHistoryWorkspace';
import type { TrafficControlProps as Props } from './trafficWorkspaceTypes';
import { TrafficPaymentDialog } from "./TrafficPaymentDialog";
import { useTrafficPayment } from "./useTrafficPayment";
import { useTrafficDoors } from "./useTrafficDoors";
import { TrafficCargoDialog } from "./TrafficCargoDialog";
import { useTrafficCargo } from "./useTrafficCargo";
import { TrafficControlGrids } from "./TrafficControlGrids";
import { AppToast } from "../../components/AppToast";
import "./trafficWorkspace.css";
import { useDoorTraffics } from "./useDoorTraffics";
import { useTrafficOperations } from "./useTrafficOperations";
import { useTrafficDoor } from "./useTrafficDoor";
import { useTrafficKeyboardNavigation } from "./useTrafficKeyboardNavigation";
import { trafficActionState } from "./trafficActionState";
import { TrafficOperationActions } from "./TrafficOperationActions";
import { useTrafficIdentity } from "./useTrafficIdentity";
import { TrafficIdentitySummary } from "./TrafficIdentitySummary";
import { TrafficWorkspaceSplitter } from "./TrafficWorkspaceSplitter";
import { TrafficDetectionPanel } from "./TrafficDetectionPanel";
import { FloatingPlateHistory } from "./FloatingPlateHistory";
import { usePlateDetectionHistory } from "./usePlateDetectionHistory";
import { useTrafficDetectionWorkflow } from './useTrafficDetectionWorkflow';
import { TrafficVehicleDialog } from "./TrafficVehicleDialog";
import type { VehicleDraft } from "./trafficIdentityService";
import { trafficAlerts } from "./trafficPolicy";
import { appConfig } from '../../config';
import { hasOpenTraffic, hasTrafficTime, TrafficOperationError } from "./trafficOperationService";
import { useTranslation } from 'react-i18next';
import { AppPopup } from "../../components/AppPopup";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Alert, Box, FormControl, InputLabel, MenuItem, Paper, Select, TextField, Tooltip, Typography } from "@mui/material";
import { useEventCallback } from '@mui/material/utils';
import type { HshDetectionHandler } from "../../api/hshDetectionRealtime";
import type { ShahabHistorySnapshot } from '../../api/shahabTrafficRealtime';
import { IranianPlateInput, isValidIranianPlate, normalizeIranianPlateValue, type VehiclePlateType } from "../../components/IranianPlateInput";
import { ManagementWorkspaceFrame } from "../../components/management/ManagementWorkspaceFrame";
import { TrafficCameraPanels } from "../../components/management/TrafficCameraPanels";
import { recordValue, type RecordValue } from "../../utils/records";
import type { TrafficCameraCapture } from './trafficImageCapture';
import { trafficAuthorizationIssue, trafficAuthorizationSubmitIssue, type TrafficAuthorizationInput } from './trafficAuthorization';
import { parseTrafficQr } from './trafficQr';
type TrafficRow = RecordValue;
type OperationMode = "idle" | "enter" | "exit";
const valueOf = (row: RecordValue, key: string) => recordValue(row, key);
const numberOf = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
export function TrafficControlWorkspace({
  title,
  pageTitle,
  parkingId,
  language,
  userId,
  isCommercialParking,
  canEditVehicle = false,
  canSearchHistory = false
}: Props) {
  const { t } = useTranslation(undefined, { lng: language });
  const doorLabelId = useId();
  const topPanelRef = useRef<HTMLElement>(null);
  const detectionPanelRef = useRef<HTMLDivElement>(null);
  const cameraCaptureRef = useRef<TrafficCameraCapture>(null);
  const submissionLocked = useRef(false);
  const plateFieldRef = useRef<HTMLDivElement>(null);
  const [topHeight, setTopHeight] = useState<number | null>(null);
  const operations = useTrafficOperations();
  const lookupSequence = useRef(0);
  const [plate, setPlate] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [memberCode, setMemberCode] = useState('');
  const [carType, setCarType] = useState<VehiclePlateType>("0");
  const {
    doors,
    doorId: entryDoorId,
    setDoorId: setEntryDoorId,
    error: doorsError
  } = useTrafficDoors(parkingId);
  const {
    items: plateHistoryItems,
    status: plateHistoryStatus,
    recordDetection,
    receiveSnapshot,
    setHistoryStatus
  } = usePlateDetectionHistory(`${parkingId}:${entryDoorId}`);
  const [plateHistoryOpen, setPlateHistoryOpen] = useState(false);
  const [historyPlateLookup, setHistoryPlateLookup] = useState<{
    doorId: string;
    plate: string;
  } | null>(null);
  const trafficDoor = useTrafficDoor(Number(entryDoorId), true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyBusy, setHistoryBusy] = useState(false);
  const identity = useTrafficIdentity(parkingId, entryDoorId, canEditVehicle);
  const [vehicleDraft, setVehicleDraft] = useState<VehicleDraft | null>(null);
  const [vehicleEditing, setVehicleEditing] = useState(false);
  const [vehicleBusy, setVehicleBusy] = useState(false);
  const [vehicleError, setVehicleError] = useState('');
  const lookupInFlight = useRef(false);
  const [carInfo, setCarInfo] = useState<RecordValue | null>(null);
  const actionState = trafficActionState(trafficDoor.door?.type, carInfo);
  const [operationMode, setOperationMode] = useState<OperationMode>("idle");
  const [lookupLoading, setLookupLoading] = useState(false);
  const doorTraffics = useDoorTraffics(Number(entryDoorId), true);
  const rows = doorTraffics.rows;
  const loading = doorTraffics.loading;
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const payment = useTrafficPayment({
    language,
    door: trafficDoor.door,
    pay: operations.pay,
    onError: setError,
    onPendingChange: setWorking,
    onRestoreFocus: () => keyboard.requestFocus(carInfo ? 'actions' : 'plate'),
    onPaid: async () => {
      setNotice(t('trafficWorkspace.cashSettled'));
      clearLookup();
      setPlate("");
      setCardNumber("");
      setMemberCode("");
      await load();
    }
  });
  const billBlocksInput = payment.blocksInput;
  const cargo = useTrafficCargo(async outbound => {
    setNotice(t(outbound ? 'trafficCargo.outboundSaved' : 'trafficCargo.inboundSaved'));
    await load();
  });
  const activateDetection = useEventCallback((event: Parameters<HshDetectionHandler>[0]) => {
    const nextPlate = normalizeIranianPlateValue(event.plateText);
    clearLookup();
    setPlate(nextPlate);
    setCardNumber('');
    setMemberCode('');
    setCarType(/^\d{8}$/.test(nextPlate) ? '1' : '0');
    setHistoryPlateLookup({ doorId: entryDoorId, plate: nextPlate });
  });
  const { latestDetection, receiveDetection, receiveSnapshot: receiveWorkSnapshot, selectPlate, finishPlate, cancelPlate, capturePlateImage } = useTrafficDetectionWorkflow({
    scopeKey: `${parkingId}:${entryDoorId}`,
    plate,
    blocked: working || operations.pending || payment.isOpen || historyOpen || plateHistoryOpen || lookupLoading || vehicleBusy
      || Boolean(vehicleDraft) || Boolean(carInfo) || Boolean(plate || cardNumber || memberCode) || trafficDoor.loading || Boolean(trafficDoor.error) || cargo.isOpen,
    onActivate: activateDetection,
  });
  const handleSnapshot = useCallback((snapshot: ShahabHistorySnapshot) => {
    receiveSnapshot(snapshot);
    receiveWorkSnapshot(snapshot);
  }, [receiveSnapshot, receiveWorkSnapshot]);
  const handleDetection = useCallback<HshDetectionHandler>((event, loadArtifact) => {
    recordDetection(event);
    receiveDetection(event, loadArtifact);
  }, [recordDetection, receiveDetection]);
  useEffect(() => {
    lookupSequence.current++;
    setCarInfo(null);
    setOperationMode('idle');
    setLookupLoading(false);
    setVehicleDraft(null);
    setVehicleError('');
    return () => {
      lookupSequence.current++;
    };
  }, [parkingId, entryDoorId]);
  const load = async () => {
    await doorTraffics.refresh();
  };
  const loadError = doorsError ? t('trafficWorkspace.loadError') : '';
  const applyIdentity = (details: TrafficIdentity) => {
    const info = details.info;
    const previousQr = identity.details?.qr;
    const sameQrTraffic = previousQr && numberOf(valueOf(info, 'DumpId')) === previousQr.dumpId
      && normalizeIranianPlateValue(String(valueOf(info, 'Plate') ?? '')) === previousQr.plate;
    const qr = details.qr ?? (sameQrTraffic ? previousQr : undefined);
    identity.setDetails({ ...details, ...(qr ? { qr } : {}) });
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
  const operationError = (cause: unknown, fallback: string) => cause instanceof TrafficOperationError ? cause.messageKey ? t(`trafficIdentity.${cause.messageKey}`) : cause.userMessage || fallback : fallback;
  const authorizationInput = (values: Partial<TrafficAuthorizationInput> = {}): TrafficAuthorizationInput => ({
    authorizationType: trafficDoor.door?.authorizationType, plate, carType, card: cardNumber, qr: identity.details?.qr, ...values,
  });
  const checkAuthorization = (input = authorizationInput(), image?: string | null, report = false) => {
    const issue = image === undefined ? trafficAuthorizationIssue(input) : trafficAuthorizationSubmitIssue(input, image);
    if (!issue) return true;
    keyboard.requestFocus(issue.focus);
    if (report || image !== undefined || issue.key === 'invalidQr') setError(t(`trafficIdentity.${issue.key}`));
    return false;
  };
  const lookupCar = async (force = false, source?: 'plate' | 'card' | 'member') => {
    // Moving focus to Register must not launch a second lookup and disable the click.
    if (lookupInFlight.current || working || billBlocksInput || vehicleBusy || trafficDoor.loading || !force && carInfo && operationMode !== 'idle' || !plate && !cardNumber && !memberCode) return;
    if (source === 'plate' && !isValidIranianPlate(plate, carType)) return;
    if (source === 'card' && !cardNumber.trim() || source === 'member' && !memberCode.trim()) return;
    if (!checkAuthorization()) return;
    const requestId = ++lookupSequence.current;
    lookupInFlight.current = true;
    setLookupLoading(true);
    setError("");
    try {
      const details = await identity.lookup(plate, cardNumber, memberCode);
      if (requestId !== lookupSequence.current) return;
      applyIdentity(details);
      return;
    } catch (cause) {
      if (requestId !== lookupSequence.current) return;
      setCarInfo(null);
      identity.setDetails(null);
      setOperationMode("idle");
      setError(operationError(cause, t('trafficOperation.lookupFailed')));
      if (source) keyboard.requestFocus(source);
    } finally {
      lookupInFlight.current = false;
      if (requestId === lookupSequence.current) setLookupLoading(false);
    }
  };
  const selectVehicle = async (nextPlate: string) => {
    if (working || billBlocksInput || lookupInFlight.current || vehicleBusy) return;
    if (!checkAuthorization(authorizationInput({ plate: nextPlate }))) return;
    const requestId = ++lookupSequence.current;
    lookupInFlight.current = true;
    setLookupLoading(true);
    setError('');
    try {
      const details = await identity.lookup(nextPlate, '', '');
      if (requestId !== lookupSequence.current) return;
      if (numberOf(valueOf(details.info, 'MemberId')) !== numberOf(valueOf(carInfo ?? {}, 'MemberId'))) throw new TrafficOperationError();
      applyIdentity(details);
    } catch (cause) {
      if (requestId === lookupSequence.current) setError(operationError(cause, t('trafficOperation.lookupFailed')));
    } finally {
      lookupInFlight.current = false;
      if (requestId === lookupSequence.current) setLookupLoading(false);
    }
  };
  useEffect(() => {
    // Windows processes a completed scanner frame without requiring Enter or blur.
    if (parseTrafficQr(cardNumber)) void lookupCar(false, 'card');
  }, [cardNumber, trafficDoor.loading]);
  useEffect(() => {
    if (!historyPlateLookup) return;
    // Run the normal plate validation after React applies the explicit history selection.
    if (historyPlateLookup.doorId === entryDoorId && historyPlateLookup.plate === plate) {
      if (!isValidIranianPlate(plate, carType)) keyboard.requestFocus('plate');
      void lookupCar(false, 'plate');
    }
    setHistoryPlateLookup(null);
  }, [historyPlateLookup]);
  const openVehicle = (editing: boolean) => {
    if (!canEditVehicle || !carInfo) return;
    setVehicleEditing(editing);
    setVehicleError('');
    setVehicleDraft({
      plate: editing ? plate : '',
      name: editing ? String(valueOf(carInfo, 'CarName') ?? '') : '',
      carType: editing ? Number(carType) : 0,
      color: editing ? String(valueOf(carInfo, 'CarColor') ?? '') : '',
      model: editing ? String(valueOf(carInfo, 'CarModel') ?? '') : ''
    });
  };
  const saveVehicle = async (draft: VehicleDraft) => {
    if (!canEditVehicle || vehicleBusy || !carInfo) return;
    const requestId = ++lookupSequence.current;
    const memberId = numberOf(valueOf(carInfo, 'MemberId'));
    setVehicleBusy(true);
    setVehicleError('');
    try {
      const savedCarId = await identity.saveVehicle(memberId, draft);
      if (requestId !== lookupSequence.current) return;
      // The mutation is complete even if the follow-up lookup fails; do not offer a second save.
      setVehicleDraft(null);
      identity.setDetails(null);
      setCarInfo(null);
      setOperationMode('idle');
      setPlate(draft.plate);
      setCarType(String(draft.carType) as VehiclePlateType);
      setCardNumber('');
      setMemberCode('');
      if (!checkAuthorization(authorizationInput({ plate: draft.plate, carType: String(draft.carType), card: '', qr: null }))) return;
      const details = await identity.lookup(draft.plate, '', '');
      if (requestId !== lookupSequence.current) return;
      if (numberOf(valueOf(details.info, 'CarId')) !== savedCarId || numberOf(valueOf(details.info, 'MemberId')) !== memberId) throw new TrafficOperationError();
      applyIdentity(details);
      setNotice(t('trafficIdentity.vehicleSaved'));
    } catch (cause) {
      if (requestId === lookupSequence.current) {
        const message = operationError(cause, t('trafficIdentity.vehicleSaveError'));
        setVehicleError(message);
        setError(message);
      }
    } finally {
      setVehicleBusy(false);
    }
  };
  const registerTraffic = async () => {
    if (submissionLocked.current || working || operations.pending) return;
    setNotice('');
    if (!entryDoorId || trafficDoor.loading || !trafficDoor.door) return;
    if (!checkAuthorization(authorizationInput(), undefined, true)) return;
    if (trafficDoor.door.authorizationType === undefined && !isValidIranianPlate(plate, carType)) {
      setError(t('trafficWorkspace.liveRequired'));
      return;
    }
    submissionLocked.current = true;
    const requestId = lookupSequence.current;
    setWorking(true);
    setError("");
    try {
      if (!actionState.canEnter) throw new TrafficOperationError('', 'directionUnavailable');
      if (needsVehicle) throw new TrafficOperationError('', 'selectVehicle');
      const image = await capturePlateImage(plate, 'entry', cameraCaptureRef.current?.capture('entry') ?? null);
      if (requestId !== lookupSequence.current) return;
      if (!checkAuthorization(authorizationInput(), image)) return;
      await operations.enter({
        trafficImage: image,
        parkingId,
        doorId: Number(entryDoorId),
        doorType: trafficDoor.door?.type,
        userId,
        plate,
        carType: Number(carType),
        info: carInfo ?? {}
      });
      setNotice(t('trafficWorkspace.saved'));
      finishPlate(plate);
      setPlate("");
      setCardNumber("");
      setMemberCode("");
      clearLookup();
      keyboard.requestFocus('plate');
      await load();
    } catch (cause) {
      setError(operationError(cause, t('trafficWorkspace.saveError')));
    } finally {
      submissionLocked.current = false;
      setWorking(false);
    }
  };
  const openPay = useEventCallback(async (row: TrafficRow) => {
    if (working || operations.pending) return;
    if (isCommercialParking === undefined) {
      setError(t('trafficOperation.parkingSettingsUnavailable'));
      return;
    }
    if (isCommercialParking) {
      payment.openFromGrid(row);
      return;
    }
    setWorking(true);
    setError('');
    setNotice('');
    try {
      await operations.settleDirectly(row);
      setNotice(t('trafficOperation.settled'));
      await load();
    } catch (cause) {
      setError(operationError(cause, t('trafficOperation.paymentFailed')));
    } finally {
      setWorking(false);
    }
  });
  const openExit = useEventCallback(async (row: TrafficRow) => {
    const requestId = ++lookupSequence.current;
    if (hasTrafficTime(valueOf(row, "ExitDateTime"))) {
      setError(t('trafficWorkspace.alreadyExited'));
      return;
    }
    const rowId = numberOf(valueOf(row, "DumpId") ?? valueOf(row, "Id"));
    const rowPlate = normalizeIranianPlateValue(String(valueOf(row, "AbsolutCarPlate") ?? valueOf(row, "CarPlate") ?? valueOf(row, "Plate") ?? valueOf(row, "CarPlateReversed") ?? ""));
    const rowCard = String(valueOf(row, "CardNumber") ?? "");
    const rowMember = String(valueOf(row, "MemberCode") ?? "");
    const rowCarType = String(valueOf(row, 'CarType') ?? (/^\d{8}$/.test(rowPlate) ? '1' : '0')) as VehiclePlateType;
    setPlate(rowPlate);
    setCardNumber(rowCard);
    setMemberCode(rowMember);
    setCarType(rowCarType);
    setCarInfo(null);
    identity.setDetails(null);
    setOperationMode("exit");
    setError("");
    if (trafficDoor.loading || !checkAuthorization(authorizationInput({ plate: rowPlate, carType: rowCarType, card: rowCard, qr: null }))) return;
    setLookupLoading(true);
    try {
      const details = await identity.lookup(rowPlate, rowCard, rowMember);
      if (requestId !== lookupSequence.current) return;
      if (!hasOpenTraffic(details.info) || numberOf(valueOf(details.info, 'DumpId')) !== rowId) throw new TrafficOperationError();
      applyIdentity(details);
      return;
    } catch (cause) {
      if (requestId !== lookupSequence.current) return;
      setCarInfo(null);
      setOperationMode('idle');
      setError(cause instanceof TrafficOperationError && cause.userMessage ? cause.userMessage : t('trafficOperation.lookupFailed'));
    } finally {
      if (requestId === lookupSequence.current) setLookupLoading(false);
    }
  });
  const openCargo = useEventCallback((row: TrafficRow, outbound: boolean = false) => {
    return cargo.open(row, outbound);
  });
  const clearLookup = () => {
    lookupSequence.current++;
    setLookupLoading(false);
    setCarInfo(null);
    setOperationMode("idle");
    identity.clear();
  };
  const registerExit = async () => {
    if (submissionLocked.current || working || operations.pending) return;
    if (trafficDoor.loading || !trafficDoor.door || !checkAuthorization(authorizationInput(), undefined, true)) return;
    if (isCommercialParking === undefined) {
      setError(t('trafficOperation.parkingSettingsUnavailable'));
      return;
    }
    if (payment.isOpen) {
      payment.focus();
      return;
    }
    setNotice('');
    const dumpId = numberOf(valueOf(carInfo ?? {}, "DumpId"));
    if (!dumpId || !entryDoorId) {
      setError(t('trafficWorkspace.noOpenTraffic'));
      return;
    }
    submissionLocked.current = true;
    const requestId = lookupSequence.current;
    setWorking(true);
    setError("");
    try {
      if (!actionState.canExit) throw new TrafficOperationError('', 'directionUnavailable');
      const image = await capturePlateImage(plate, 'exit', cameraCaptureRef.current?.capture('exit') ?? null);
      if (requestId !== lookupSequence.current) return;
      if (!checkAuthorization(authorizationInput(), image)) return;
      // Like entry, operational exit uses the server clock; detection time remains display/history data.
      const result = await operations.completeExit({
        trafficImage: image,
        parkingId,
        doorId: Number(entryDoorId),
        doorType: trafficDoor.door?.type,
        userId,
        plate,
        carType: Number(carType),
        info: carInfo ?? {}
      }, null, isCommercialParking);
      finishPlate(plate);
      clearLookup();
      setPlate('');
      setCardNumber('');
      setMemberCode('');
      keyboard.requestFocus('plate');
      await load();
      if (result.settlement === 'failed') setError(t('trafficOperation.autoSettlementFailed'));
      else if (result.settlement === 'settled') setNotice(t('trafficOperation.exitSettled'));
      else {
        payment.open(result.bill, 'exit');
        setNotice(t('trafficOperation.exitSaved'));
      }
    } catch (cause) {
      setError(operationError(cause, t('trafficOperation.exitFailed')));
    } finally {
      submissionLocked.current = false;
      setWorking(false);
    }
  };
  const doorSelector = <>
    <FormControl size="small" sx={{
      minWidth: {
        xs: 150,
        sm: 190
      },
      "& .MuiInputBase-root": {
        height: 32,
        fontSize: "0.78rem"
      },
      "& .MuiInputLabel-root": {
        fontSize: "0.78rem"
      },
      "& .MuiSelect-select": {
        py: 0.5
      }
    }}>
      <InputLabel id={doorLabelId}>{t('trafficWorkspace.door')}</InputLabel>
      <Select labelId={doorLabelId} label={t('trafficWorkspace.door')} disabled={working || billBlocksInput || lookupLoading || vehicleBusy || Boolean(vehicleDraft)} value={entryDoorId} onChange={event => setEntryDoorId(event.target.value)}>
        {doors.map(door => <MenuItem key={door.id} value={String(door.id)}>
            {door.label}
          </MenuItem>)}
      </Select>
    </FormControl>
    {<Box className="traffic-door-type" role="status" aria-label={t('trafficLayout.doorType')}>
      <Typography component="span" variant="caption" color="text.secondary">{t('trafficLayout.doorType')}:</Typography>
      <Typography component="span" variant="caption" sx={{
        fontWeight: 600
      }}>
        {trafficDoor.loading ? t('trafficLayout.doorLoading') : trafficDoor.door ? t('trafficLayout.doorTypes', {
          returnObjects: true
        })[trafficDoor.door.type] : t('trafficLayout.doorUnknown')}
      </Typography>
    </Box>}
    </>;
  const operationTitle = t('trafficOperation.title');
  const policyAlerts = trafficAlerts(carInfo, actionState.direction === 'exit' ? 'exit' : 'enter', appConfig.trafficRequireExitPermission);
  const needsVehicle = operationMode === 'enter' && Boolean(carInfo) && numberOf(valueOf(carInfo ?? {}, 'MemberId')) > 0 && !identity.details?.cars.some(car => car.Id === numberOf(valueOf(carInfo ?? {}, 'CarId')) && normalizeIranianPlateValue(car.Plate) === plate);
  const identityBusy = working || operations.pending || billBlocksInput || historyOpen || lookupLoading || vehicleBusy;
  const keyboard = useTrafficKeyboardNavigation(true, entryDoorId, identityBusy || trafficDoor.loading || Boolean(vehicleDraft));
  const cancelTraffic = () => {
    cancelPlate(plate);
    clearLookup();
    setPlate('');
    setCardNumber('');
    setMemberCode('');
    setError('');
    setNotice('');
    // Restore keyboard entry after React clears and re-enables the plate fields.
    keyboard.requestFocus('plate');
  };
  const closeHistory = () => {
    if (historyBusy) return;
    setHistoryOpen(false);
    void lookupCar(true);
    void doorTraffics.refresh();
  };
  const plateInput = <Box ref={plateFieldRef} className="traffic-plate-field" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null) && keyboard.shouldIdentifyOnBlur(event.relatedTarget)) void lookupCar(false, 'plate');
  }}>
      <IranianPlateInput language={language} label={t('trafficWorkspace.plate')} value={plate} carType={carType} disabled={identityBusy || trafficDoor.loading} onComplete={() => void lookupCar(false, 'plate')} onCarTypeChange={value => {
      clearLookup();
      setCarType(value);
    }} onChange={value => {
      clearLookup();
      setPlate(value);
    }} error={Boolean(plate) && !isValidIranianPlate(plate, carType)} helperText={Boolean(plate) && !isValidIranianPlate(plate, carType) ? t('trafficWorkspace.incompletePlate') : undefined} />
    </Box>;
  const cardMemberInputs = <Box className="traffic-card-member-fields" onKeyDown={event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void lookupCar(false, (event.target as HTMLElement).closest('.traffic-member-field') ? 'member' : 'card');
    }
  }}>
      <TextField size="small" className="traffic-card-field" label={t('trafficWorkspace.card')} disabled={identityBusy || trafficDoor.loading} value={cardNumber} onChange={event => {
      clearLookup();
      setCardNumber(event.target.value);
    }} onBlur={event => {
      if (keyboard.shouldIdentifyOnBlur(event.relatedTarget)) void lookupCar(false, 'card');
    }} />
      <TextField size="small" className="traffic-member-field" label={t('trafficWorkspace.memberCode')} disabled={identityBusy || trafficDoor.loading} value={memberCode} onChange={event => {
      clearLookup();
      setMemberCode(event.target.value);
    }} onBlur={event => {
      if (keyboard.shouldIdentifyOnBlur(event.relatedTarget)) void lookupCar(false, 'member');
    }} />
    </Box>;
  return <ManagementWorkspaceFrame className={'traffic-control-workspace'} title={title} pageTitle={pageTitle} language={language} loading={loading} onRefresh={() => {
    void load();
    if (trafficDoor.error) trafficDoor.refresh();
  }} headingActions={doorSelector}>
      {<AppToast message={error || loadError || notice} severity={error || loadError ? 'error' : 'success'} onClose={() => {
      setError('');
      setNotice('');
    }} />}

      <Box ref={topPanelRef} className="traffic-top-grid" style={topHeight !== null ? {
      flexBasis: `clamp(248px, ${topHeight}px, calc(100% - 200px))`
    } : undefined}>
        <Box ref={keyboard.consoleRef} className={'traffic-control-console'} onKeyDownCapture={keyboard.onKeyDownCapture} onPointerDownCapture={keyboard.onPointerDownCapture}>
          <Tooltip title={t('trafficWorkspace.identification')} placement="top" arrow>
            <Paper variant="outlined" className="traffic-entry-identity traffic-entry-panel" sx={{
            p: 1.5
          }}>
              <Box className="traffic-vehicle-identification-grid">
                {<>{plateInput}{cardMemberInputs}</>}
                {lookupLoading && <Typography variant="caption" color="text.secondary">
                    {t('trafficWorkspace.checkingHistory')}
                  </Typography>}
              </Box>
            </Paper>
          </Tooltip>
            <Paper aria-label={operationTitle} variant="outlined" className={`traffic-entry-operation traffic-entry-panel traffic-operation-latest-panel ${"traffic-operation-tall"}`} sx={{
            p: 1.5
          }}>
              <Box className="traffic-operation-latest-layout">
                <Box className="traffic-operation-content">
                  {<Box className="traffic-operation-actions">
                    <TrafficOperationActions language={language} state={actionState} busy={identityBusy || trafficDoor.loading} blocked={needsVehicle || policyAlerts.some(alert => alert.blocked)} canSearch={canSearchHistory} canCancel={Boolean(plate || cardNumber || memberCode || carInfo || latestDetection)} onEnter={() => void registerTraffic()} onExit={() => void registerExit()} onSearch={() => {
                    if (canSearchHistory && carInfo) setHistoryOpen(true);
                  }} onCancel={cancelTraffic} />
                  </Box>}
                  <Box className="traffic-operation-information">

                    {!identity.details && <Typography variant="body2" color="text.secondary">{t('trafficIdentity.identifyHint')}</Typography>}
                    {identity.details && <TrafficIdentitySummary details={identity.details} language={language} onAutomaticClose={() => keyboard.requestFocus(needsVehicle ? 'vehicle' : 'actions')} busy={identityBusy} canEdit={canEditVehicle} onSelect={nextPlate => void selectVehicle(nextPlate)} onAdd={() => openVehicle(false)} onEdit={() => openVehicle(true)} onRetry={() => void lookupCar(true)} />}
                    {policyAlerts.map(alert => <Alert key={alert.key} severity={alert.blocked ? 'error' : 'warning'}>
                      {t(`trafficIdentity.${alert.key}`)}{alert.description ? ` — ${alert.description}` : ''}
                    </Alert>)}
                    {trafficDoor.error && <Alert severity="error">{t('trafficIdentity.doorError')}</Alert>}
                    {carInfo && actionState.direction === 'exit' && !actionState.canExit && <Alert severity="warning">{t('trafficIdentity.noEntry')}</Alert>}
                    {carInfo && actionState.direction === 'enter' && !actionState.canEnter && <Alert severity="warning">{t('trafficIdentity.alreadyEntered')}</Alert>}
                  </Box>

                </Box>
              </Box>
            </Paper>
        </Box>
        {<Box className="traffic-control-camera-column">
            <TrafficCameraPanels key={`${parkingId}:${entryDoorId}`} doorId={entryDoorId} language={language} captureRef={cameraCaptureRef} operationDirection={operationMode === 'exit' ? 'exit' : 'entry'} onDetection={handleDetection} onHistory={handleSnapshot} onHistoryStatus={setHistoryStatus} historyOpen={plateHistoryOpen} />
            <TrafficDetectionPanel detection={latestDetection} language={language} panelRef={detectionPanelRef} />
          </Box>}
      </Box>
      {entryDoorId && <FloatingPlateHistory key={`plate-history:${parkingId}:${entryDoorId}`} items={plateHistoryItems} status={plateHistoryStatus} language={language} anchorRef={detectionPanelRef} busy={identityBusy || trafficDoor.loading || Boolean(trafficDoor.error) || Boolean(vehicleDraft) || cargo.busy} hasCurrentInput={Boolean(plate || cardNumber || memberCode || carInfo)} onOpenChange={setPlateHistoryOpen} onSelect={item => {
      if (identityBusy || lookupInFlight.current || trafficDoor.loading || trafficDoor.error || vehicleDraft || cargo.busy) return false;
      const nextPlate = normalizeIranianPlateValue(item.plate);
      selectPlate(nextPlate);
      clearLookup();
      setPlate(nextPlate);
      setCardNumber('');
      setMemberCode('');
      setCarType(/^\d{8}$/.test(nextPlate) ? '1' : '0');
      setError('');
      setNotice('');
      setHistoryPlateLookup({
        doorId: entryDoorId,
        plate: nextPlate
      });
      return true;
    }} />}
      {<TrafficWorkspaceSplitter panelRef={topPanelRef} onResize={setTopHeight} language={language} />}
      {<TrafficControlGrids key={`${parkingId}:${entryDoorId}`} rows={rows} language={language} loading={doorTraffics.loading} error={doorTraffics.error} updatedAt={doorTraffics.updatedAt} busy={identityBusy || cargo.busy || Boolean(vehicleDraft)} onExit={openExit} onPay={openPay} onCargo={openCargo} />}
      {<TrafficVehicleDialog draft={vehicleDraft} editing={vehicleEditing} language={language} busy={vehicleBusy} error={vehicleError} onClose={() => setVehicleDraft(null)} onSave={draft => void saveVehicle(draft)} />}
      {historyOpen && carInfo && <AppPopup open title={t('homeMenu.items.traffic-records')} onClose={closeHistory} busy={historyBusy} maxWidth="xl" cancelLabel={t('trafficIdentity.close')}>
        <TrafficHistoryWorkspace title={t('trafficOperation.search')} parkingId={parkingId} isCommercialParking={isCommercialParking} language={language} initialIdentity={{
        plate,
        card: cardNumber,
        member: memberCode,
        doorId: entryDoorId
      }} onBusyChange={setHistoryBusy} />
      </AppPopup>}
      <TrafficCargoDialog language={language} cargo={cargo} />

      <TrafficPaymentDialog language={language} payment={payment} />
    </ManagementWorkspaceFrame>;
}
