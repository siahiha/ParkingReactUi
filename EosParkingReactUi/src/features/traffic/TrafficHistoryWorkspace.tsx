import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';
import type { TrafficHistoryProps as Props } from './trafficWorkspaceTypes';
import { TrafficPaymentDialog } from "./TrafficPaymentDialog";
import { useTrafficPayment } from "./useTrafficPayment";
import { useTrafficDoors } from "./useTrafficDoors";
import { useTrafficRecords } from "./useTrafficRecords";
import { TrafficCargoDialog } from "./TrafficCargoDialog";
import { useTrafficCargo } from "./useTrafficCargo";
import { formatDateTime } from '../../utils/formatters';
import "./trafficWorkspace.css";
import { useTrafficOperations } from "./useTrafficOperations";
import { useTrafficKeyboardNavigation } from "./useTrafficKeyboardNavigation";
import { hasOpenTraffic, hasTrafficTime, TrafficOperationError } from "./trafficOperationService";
import { useTranslation } from 'react-i18next';
import { AppPopup } from "../../components/AppPopup";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Alert, Box, Button, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, TextField, Tooltip, Typography } from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import { AppDataGrid, type AppDataGridColumn } from "../../components/AppDataGrid";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { EosDateTimePicker } from "../../components/EosDateTimePicker";
import { IranianPlateInput, isValidIranianPlate, normalizeIranianPlateValue, type VehiclePlateType } from "../../components/IranianPlateInput";
import { ManagementWorkspaceFrame } from "../../components/management/ManagementWorkspaceFrame";
import { ResourceState } from "../../components/management/ResourceState";
import { recordValue, type RecordValue } from "../../utils/records";
type TrafficRow = RecordValue;
type OperationMode = "idle" | "enter" | "exit";
const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const inputDateTime = (value: unknown) => {
  const parsed = new Date(String(value ?? ""));
  return Number.isNaN(parsed.getTime()) ? "" : `${isoDate(parsed)}T${parsed.toISOString().slice(11, 16)}`;
};
const apiDateTime = (value: string) => value ? `${value.replace("T", " ")}:00` : null;
const valueOf = (row: RecordValue, key: string) => recordValue(row, key);
const numberOf = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const payTypeLabel = (value: unknown, t: TFunction) => {
  if (value === null || value === undefined || value === "") return "—";
  const labels = t('trafficWorkspace.paymentTypes', {
    returnObjects: true
  });
  const numericValue = Number(value);
  return Number.isInteger(numericValue) && labels[numericValue] ? labels[numericValue] : String(value);
};
export function TrafficHistoryWorkspace({
  title,
  pageTitle,
  parkingId,
  language,
  userId,
  isCommercialParking,
  initialIdentity,
  onBusyChange
}: Props) {
  const { t } = useTranslation(undefined, { lng: language });
  const doorLabelId = useId();
  const topPanelRef = useRef<HTMLElement>(null);
  const plateFieldRef = useRef<HTMLDivElement>(null);
  const operations = useTrafficOperations();
  const lookupSequence = useRef(0);
  const isPersian = language === "fa";
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
  const [plate, setPlate] = useState(initialIdentity?.plate ?? '');
  const [cardNumber, setCardNumber] = useState(initialIdentity?.card ?? '');
  const [memberCode, setMemberCode] = useState(initialIdentity?.member ?? '');
  const [carType, setCarType] = useState<VehiclePlateType>("0");
  const {
    doors,
    doorId: entryDoorId,
    setDoorId: setEntryDoorId,
    error: doorsError
  } = useTrafficDoors(parkingId, initialIdentity?.doorId);
  const lookupInFlight = useRef(false);
  const [entryDateTime, setEntryDateTime] = useState("");
  const [exitDateTime, setExitDateTime] = useState("");
  const [carInfo, setCarInfo] = useState<RecordValue | null>(null);
  const [memberCredit, setMemberCredit] = useState<RecordValue | null>(null);
  const [operationMode, setOperationMode] = useState<OperationMode>("idle");
  const [lookupLoading, setLookupLoading] = useState(false);
  const records = useTrafficRecords({
    parkingId,
    startDate,
    endDate,
    sourceType
  }, true);
  const rows = records.rows;
  const loading = records.loading;
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const payment = useTrafficPayment({
    language,
    door: null,
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
      setEntryDateTime("");
      setExitDateTime("");
      await load();
    }
  });
  const billBlocksInput = payment.blocksInput;
  const cargo = useTrafficCargo(async outbound => {
    setNotice(t(outbound ? 'trafficCargo.outboundSaved' : 'trafficCargo.inboundSaved'));
    await load();
  });
  useEffect(() => {
    onBusyChange?.(working || lookupLoading || billBlocksInput || editOpen || deleteOpen || cargo.isOpen);
  }, [onBusyChange, working, lookupLoading, billBlocksInput, editOpen, deleteOpen, cargo.isOpen]);
  useEffect(() => {
    lookupSequence.current++;
    setCarInfo(null);
    setMemberCredit(null);
    setOperationMode('idle');
    setLookupLoading(false);
    return () => {
      lookupSequence.current++;
    };
  }, [parkingId, entryDoorId]);
  const load = async () => {
    await records.refresh();
    setSelectedId(null);
  };
  const loadError = doorsError ? t('trafficWorkspace.loadError') : records.error ? t(`trafficWorkspace.${records.error}`) : '';
  const operationError = (cause: unknown, fallback: string) => cause instanceof TrafficOperationError ? cause.messageKey ? t(`trafficIdentity.${cause.messageKey}`) : cause.userMessage || fallback : fallback;
  const lookupCar = async (force = false, source?: 'plate' | 'card' | 'member') => {
    // Moving focus to Register must not launch a second lookup and disable the click.
    if (lookupInFlight.current || working || billBlocksInput || !force && carInfo && operationMode !== 'idle' || !plate && !cardNumber && !memberCode) return;
    const requestId = ++lookupSequence.current;
    lookupInFlight.current = true;
    setLookupLoading(true);
    setError("");
    try {
      const info = await operations.lookup(parkingId, plate, cardNumber, memberCode);
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
          const credit = await records.credit(memberId);
          if (requestId !== lookupSequence.current) return;
          setMemberCredit(credit);
        }
      } else {
        setOperationMode("enter");
      }
    } catch (cause) {
      if (requestId !== lookupSequence.current) return;
      setCarInfo(null);
      setOperationMode("idle");
      setError(operationError(cause, t('trafficOperation.lookupFailed')));
      if (source) keyboard.requestFocus(source);
    } finally {
      lookupInFlight.current = false;
      if (requestId === lookupSequence.current) setLookupLoading(false);
    }
  };
  const visibleRows = useMemo(() => rows, [rows]);
  const registerTraffic = async () => {
    setNotice('');
    if (!isValidIranianPlate(plate, carType) || !entryDoorId || !entryDateTime) {
      setError(t('trafficWorkspace.required'));
      return;
    }
    setWorking(true);
    setError("");
    try {
      await records.create({
        plate,
        parkingId,
        carType: Number(carType),
        enterDateTime: apiDateTime(entryDateTime),
        exitDateTime: apiDateTime(exitDateTime),
        doorId: Number(entryDoorId)
      });
      setNotice(t('trafficWorkspace.saved'));
      setPlate("");
      setCardNumber("");
      setMemberCode("");
      setEntryDateTime("");
      setExitDateTime("");
      clearLookup();
      keyboard.requestFocus('plate');
      await load();
    } catch (cause) {
      setError(operationError(cause, t('trafficWorkspace.saveError')));
    } finally {
      setWorking(false);
    }
  };
  const selected = rows.find(row => numberOf(valueOf(row, "DumpId")) === selectedId);
  const updateTraffic = async () => {
    if (!selected) return;
    setWorking(true);
    try {
      await records.update(selected, apiDateTime(editEnter), apiDateTime(editExit));
      setEditOpen(false);
      setNotice(t('trafficWorkspace.updated'));
      await load();
    } catch {
      setError(t('trafficWorkspace.saveError'));
    } finally {
      setWorking(false);
    }
  };
  const removeTraffic = async () => {
    if (!selectedId || !selected) return;
    const sourceTypeValue = numberOf(valueOf(selected, "SourceType"));
    const canDelete = sourceTypeValue === 3 || sourceTypeValue === 4 && !valueOf(selected, "ExitDateTime");
    if (!canDelete) {
      setDeleteOpen(false);
      setError(t('trafficWorkspace.manualDeleteOnly'));
      return;
    }
    setWorking(true);
    try {
      await records.remove(selectedId);
      setDeleteOpen(false);
      setNotice(t('trafficWorkspace.deleted'));
      await load();
    } catch {
      setError(t('trafficWorkspace.saveError'));
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
  const openCargo = (row: TrafficRow, outbound = false) => {
    setSelectedId(numberOf(valueOf(row, 'DumpId') ?? valueOf(row, 'Id')));
    return cargo.open(row, outbound);
  };
  const clearLookup = () => {
    lookupSequence.current++;
    setLookupLoading(false);
    setCarInfo(null);
    setMemberCredit(null);
    setOperationMode("idle");
  };
  const registerExit = async () => {
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
    setWorking(true);
    setError("");
    try {
      const result = await operations.completeExit({
        parkingId,
        doorId: Number(entryDoorId),
        doorType: undefined,
        userId,
        plate,
        carType: Number(carType),
        info: carInfo ?? {}
      }, apiDateTime(exitDateTime), isCommercialParking);
      clearLookup();
      setPlate('');
      setCardNumber('');
      setMemberCode('');
      setEntryDateTime('');
      setExitDateTime('');
      keyboard.requestFocus('plate');
      await load();
      if (result.settlement === 'failed') setError(t('trafficOperation.autoSettlementFailed'));
      else if (result.settlement === 'settled') setNotice(t('trafficOperation.exitSettled'));
      else {
        payment.open(result.bill, 'grid');
        setNotice(t('trafficOperation.exitSaved'));
      }
    } catch (cause) {
      setError(operationError(cause, t('trafficOperation.exitFailed')));
    } finally {
      setWorking(false);
    }
  };
  const handleOperation = () => operationMode === "exit" ? void registerExit() : operationMode === 'enter' ? void registerTraffic() : void lookupCar();
  const settleDirectly = async (row: TrafficRow) => {
    if (isCommercialParking !== false || working || operations.pending) return;
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
  };
  const actionButton = (label: string, icon: ReactNode, onClick: () => void) => <IconButton size="small" color="primary" aria-label={label} title={label} onClick={event => {
    event.stopPropagation();
    onClick();
  }} sx={{
    p: 0,
    width: 26,
    height: 26,
    display: "inline-flex"
  }}>
      {icon}
    </IconButton>;
  const selectedSourceType = selected ? numberOf(valueOf(selected, "SourceType")) : -1;
  const canEditEntry = selectedSourceType === 3 || selectedSourceType === 4;
  const canEditExit = selectedSourceType === 3 || selectedSourceType === 5 || Boolean(selected && !valueOf(selected, "ExitDateTime"));
  const recordColumns: AppDataGridColumn<TrafficRow>[] = [{
    key: "MemberCode",
    label: t('trafficWorkspace.membershipCode'),
    width: 155,
    minWidth: 155
  }, {
    key: "MemberFullName",
    label: t('trafficWorkspace.memberName'),
    width: 150,
    minWidth: 150
  }, {
    key: "CarPlate",
    label: t('trafficWorkspace.plate'),
    width: 155,
    minWidth: 155,
    getFilterValue: (row: TrafficRow) => valueOf(row, "CarPlateReversed") ?? valueOf(row, "CarPlate")
  }, {
    key: "EnterDateTime",
    label: t('trafficWorkspace.entryColumn'),
    width: 155,
    minWidth: 155,
    render: (row: TrafficRow) => formatDateTime(valueOf(row, "EnterDateTime"), language)
  }, {
    key: "ExitDateTime",
    label: t('trafficWorkspace.exitColumn'),
    width: 137,
    minWidth: 137,
    render: (row: TrafficRow) => formatDateTime(valueOf(row, "ExitDateTime"), language)
  }, {
    key: "PayType",
    label: t('trafficWorkspace.paymentStatus'),
    width: 105,
    minWidth: 105,
    render: (row: TrafficRow) => payTypeLabel(valueOf(row, "PayType"), t)
  }, {
    key: "CommonCost",
    label: t('trafficWorkspace.paidAmount'),
    width: 105,
    minWidth: 105
  }, {
    key: "CargoAction",
    label: "",
    width: 35,
    minWidth: 35,
    compact: true,
    filterable: false,
    render: (row: TrafficRow) => actionButton(t('trafficCargo.register'), <LocalShippingRoundedIcon sx={{
      fontSize: 17
    }} />, () => void openCargo(row))
  }, {
    key: "EditAction",
    label: "",
    width: 35,
    minWidth: 35,
    compact: true,
    filterable: false,
    render: (row: TrafficRow) => actionButton(t('trafficWorkspace.applyExit'), <EditRoundedIcon sx={{
      fontSize: 17
    }} />, () => openEdit(row))
  }, {
    key: "DeleteAction",
    label: "",
    width: 35,
    minWidth: 35,
    compact: true,
    filterable: false,
    render: (row: TrafficRow) => actionButton(t('trafficWorkspace.remove'), <DeleteOutlineRoundedIcon sx={{
      fontSize: 17
    }} />, () => openDelete(row))
  }, {
    key: "RowIndicator",
    label: "",
    width: 24,
    minWidth: 24,
    compact: true,
    filterable: false,
    render: (row: TrafficRow) => selectedId === numberOf(valueOf(row, "DumpId") ?? valueOf(row, "Id")) ? "↪" : ""
  }];
  if (isCommercialParking === false) recordColumns.push({
    key: 'PayAction',
    label: '',
    width: 35,
    minWidth: 35,
    compact: true,
    filterable: false,
    render: (row: TrafficRow) => hasTrafficTime(valueOf(row, 'ExitDateTime')) && [0, 9].includes(numberOf(valueOf(row, 'PayType')))
      ? actionButton(t('trafficGrid.pay'), <PaymentsRoundedIcon sx={{ fontSize: 17 }} />, () => void settleDirectly(row)) : null,
  });
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
      <Select labelId={doorLabelId} label={t('trafficWorkspace.door')} disabled={working || billBlocksInput || lookupLoading} value={entryDoorId} onChange={event => setEntryDoorId(event.target.value)}>
        {doors.map(door => <MenuItem key={door.id} value={String(door.id)}>
            {door.label}
          </MenuItem>)}
      </Select>
    </FormControl>

    </>;
  const operationTitle = operationMode === "exit" ? t('trafficWorkspace.registerExit') : operationMode === "enter" ? t('trafficWorkspace.registerEntry') : t('trafficWorkspace.operation');
  const operationHint = operationMode === "exit" ? t('trafficWorkspace.exitHint') : operationMode === "enter" ? t('trafficWorkspace.entryHint') : "";
  const identityBusy = working || operations.pending || billBlocksInput || lookupLoading;
  const keyboard = useTrafficKeyboardNavigation(false, entryDoorId, identityBusy);
  const plateInput = <Box ref={plateFieldRef} className="traffic-plate-field">
      <IranianPlateInput language={language} label={t('trafficWorkspace.plate')} value={plate} carType={carType} disabled={identityBusy} onCarTypeChange={value => {
      clearLookup();
      setCarType(value);
    }} onChange={value => {
      clearLookup();
      setPlate(value);
    }} error={Boolean(plate) && !isValidIranianPlate(plate, carType)} helperText={Boolean(plate) && !isValidIranianPlate(plate, carType) ? t('trafficWorkspace.incompletePlate') : undefined} />
    </Box>;
  const cardMemberInputs = <Box className="traffic-card-member-fields">
      <TextField size="small" className="traffic-card-field" label={t('trafficWorkspace.card')} disabled={identityBusy} value={cardNumber} onChange={event => {
      clearLookup();
      setCardNumber(event.target.value);
    }} onBlur={event => {
      if (keyboard.shouldIdentifyOnBlur(event.relatedTarget)) void lookupCar(false, 'card');
    }} />
      <TextField size="small" className="traffic-member-field" label={t('trafficWorkspace.memberCode')} disabled={identityBusy} value={memberCode} onChange={event => {
      clearLookup();
      setMemberCode(event.target.value);
    }} onBlur={event => {
      if (keyboard.shouldIdentifyOnBlur(event.relatedTarget)) void lookupCar(false, 'member');
    }} />
    </Box>;
  return <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} language={language} loading={loading} onRefresh={() => {
    void load();
  }} headingActions={doorSelector}>

      {notice && <Alert severity="success" sx={{
      mb: 2
    }}>
          {notice}
        </Alert>}
      {(error || loadError) && <Alert severity="error" sx={{
      mb: 2
    }}>
          {error || loadError}
        </Alert>}
      <Box ref={topPanelRef} className="traffic-top-grid">
        <Box ref={keyboard.consoleRef} className={'traffic-history-console'} onKeyDownCapture={keyboard.onKeyDownCapture} onPointerDownCapture={keyboard.onPointerDownCapture}>
          <Tooltip title={t('trafficWorkspace.identification')} placement="top" arrow>
            <Paper variant="outlined" className="traffic-entry-identity traffic-entry-panel" sx={{
            p: 1.5
          }}>
              <Box className="traffic-vehicle-identification-grid" onBlur={event => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) void lookupCar();
            }}>
                {<>{cardMemberInputs}{plateInput}</>}
                {lookupLoading && <Typography variant="caption" color="text.secondary">
                    {t('trafficWorkspace.checkingHistory')}
                  </Typography>}
              </Box>
            </Paper>
          </Tooltip>
          <Tooltip title={operationTitle} placement="top" arrow>
            <Paper variant="outlined" className={`traffic-entry-operation traffic-entry-panel traffic-operation-latest-panel ${""}`} sx={{
            p: 1.5
          }}>
              <Box className="traffic-operation-latest-layout">
                <Box className="traffic-operation-content">

                  <Box className="traffic-operation-information">
                    {operationHint && <Typography variant="body2" color="text.secondary" sx={{
                    mb: 1.5
                  }}>
                        {operationHint}
                      </Typography>}
                    {<Box className="traffic-operation-details" aria-label={t('trafficWorkspace.selectedPlate')}>
                      <Typography variant="body2" className="traffic-operation-detail-row">
                        <span>{t('trafficWorkspace.plate')}</span>
                        <strong dir="ltr">{plate || "—"}</strong>
                      </Typography>
                      {carInfo && <>
                          <Typography variant="body2" className="traffic-operation-detail-row">
                            <span>{t('trafficWorkspace.member')}</span>
                            <strong>{String(valueOf(carInfo, "MemberFullName") ?? valueOf(carInfo, "Name") ?? "—")}</strong>
                          </Typography>
                          <Typography variant="body2" className="traffic-operation-detail-row">
                            <span>{t('trafficWorkspace.membershipCode')}</span>
                            <strong>{String(valueOf(carInfo, "MemberCode") ?? "—")}</strong>
                          </Typography>
                          <Typography variant="body2" className="traffic-operation-detail-row">
                            <span>{t('trafficWorkspace.vehicle')}</span>
                            <strong>{String(valueOf(carInfo, "CarName") ?? valueOf(carInfo, "CarModel") ?? "—")}</strong>
                          </Typography>
                          <Typography variant="body2" className="traffic-operation-detail-row">
                            <span>{t('trafficWorkspace.color')}</span>
                            <strong>{String(valueOf(carInfo, "CarColor") ?? "—")}</strong>
                          </Typography>
                          <Typography variant="body2" className="traffic-operation-detail-row">
                            <span>{t('trafficWorkspace.openTraffic')}</span>
                            <strong dir="ltr">{formatDateTime(valueOf(carInfo, "EnterDateTime"), language)}</strong>
                          </Typography>
                          <Typography variant="body2" className="traffic-operation-detail-row">
                            <span>{t('trafficWorkspace.tariff')}</span>
                            <strong>{String(valueOf(carInfo, "MemberTariffName") ?? valueOf(carInfo, "TariffName") ?? valueOf(carInfo, "TarrifTitle") ?? "—")}</strong>
                          </Typography>
                          {<Typography variant="body2" className="traffic-operation-detail-row">
                            <span>{t('trafficWorkspace.credit')}</span>
                            <strong>{String(valueOf(memberCredit ?? {}, "Credit") ?? valueOf(memberCredit ?? {}, "CurrentCredit") ?? valueOf(carInfo, "CashAmount") ?? "—")}</strong>
                          </Typography>}
                        </>}
                    </Box>}

                  </Box>
                  {<Box className="traffic-operation-actions">
                    {operationMode === "exit" && <Typography variant="body2" sx={{
                    mb: 1.5
                  }}>
                        {t('trafficWorkspace.entryTimeLabel')}
                        <strong>
                          {formatDateTime(valueOf(carInfo ?? {}, "EnterDateTime"), language)}
                        </strong>
                      </Typography>}
                    {operationMode === "enter" && <EosDateTimePicker language={language} label={t('trafficWorkspace.entry')} value={entryDateTime} onChange={setEntryDateTime} />}
                    {operationMode === "exit" && <EosDateTimePicker language={language} label={t('trafficWorkspace.exit')} value={exitDateTime} onChange={setExitDateTime} />}
                    <Button variant="contained" color="primary" fullWidth onClick={handleOperation} disabled={identityBusy || !entryDoorId || !plate && !cardNumber && !memberCode}>
                      {operationMode === "exit" ? t('trafficWorkspace.calculateExit') : operationMode === "enter" ? t('trafficWorkspace.registerEntry') : t('trafficOperation.lookup')}
                    </Button>
                  </Box>}
                </Box>
              </Box>
            </Paper>
          </Tooltip>
        </Box>

      </Box>

      {<Box className="traffic-details-section traffic-records-grid">
        <ResourceState loading={loading} error="" empty={visibleRows.length === 0} loadingLabel={t('trafficWorkspace.loading')} emptyLabel={t('trafficWorkspace.empty')}>
          <AppDataGrid<TrafficRow> direction={isPersian ? "rtl" : "ltr"} rows={visibleRows} columns={recordColumns} filterable={Boolean(initialIdentity)} rowKey={row => String(valueOf(row, "DumpId") ?? valueOf(row, "Id"))} selectedKey={selectedId} onRowClick={row => setSelectedId(numberOf(valueOf(row, "DumpId") ?? valueOf(row, "Id")))} onRowDoubleClick={row => openEdit(row)} />
        </ResourceState>
      </Box>}

      <TrafficCargoDialog language={language} cargo={cargo} />
      <AppPopup dir={isPersian ? "rtl" : "ltr"} open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" busy={working} title={t('trafficWorkspace.editTitle')} actions={[{
      id: 'action-0',
      label: t('trafficWorkspace.cancel'),
      onClick: () => setEditOpen(false)
    }, {
      id: 'action-1',
      label: t('trafficWorkspace.register'),
      variant: "contained",
      onClick: () => void updateTraffic(),
      disabled: working
    }]}>
          <EosDateTimePicker language={language} label={t('trafficWorkspace.entry')} value={editEnter} onChange={setEditEnter} disabled={!canEditEntry} sx={{
        mt: 1
      }} />
          <EosDateTimePicker language={language} label={t('trafficWorkspace.exit')} value={editExit} onChange={setEditExit} disabled={!canEditExit} sx={{
        mt: 2
      }} />
        </AppPopup>
      <ConfirmDialog open={deleteOpen} title={t('trafficWorkspace.remove')} message={t('trafficWorkspace.deleteConfirm')} cancelLabel={t('trafficWorkspace.cancel')} confirmLabel={t('trafficWorkspace.remove')} busy={working} onClose={() => setDeleteOpen(false)} onConfirm={() => void removeTraffic()} />
      <TrafficPaymentDialog language={language} payment={payment} />
    </ManagementWorkspaceFrame>;
}
