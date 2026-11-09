import _ from "lodash";
import moment from "moment";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { isHexColorLight } from "@/services/checks/color";
import { titleFormat } from "@/services/format/string";

/**
 * @description Row for one instrument: current state pill plus a plain select to change the
 * instrument state (only when the user has edit permission).
 * @param {Object} props
 * @param {String} props.instrument_tag Instrument tag
 * @returns {JSX.Element} The instrument state changer.
 */
function InstrumentStateChanger({ instrument_tag }) {
    const { data: currentTags, isSuccess, refetch } = api.instruments.core.useGetStatesOfAnInstrument(
        { tag: instrument_tag, limit: 1 }, { enabled: _.isString(instrument_tag) }
    );
    const { data: allStates, isSuccess: isSuccessStates } = api.instruments.core.useGetAllInstrumentStates();
    const { data: permissions, isSuccess: isSuccessPermissions } = api.instruments.permissions.useGetInstrumentPermissions();
    const { mutate: updateState, isPending } = api.instruments.core.usePostInstrumentState({
        onSuccess: () => refetch(),
    });

    if (!isSuccess || !isSuccessStates) return null;

    const currentTag = _.isArray(currentTags) && currentTags.length > 0 ? currentTags[0] : null;
    const current = _.isArray(allStates) ? allStates.find(s => s.tag === currentTag) : null;
    const canChange = isSuccessPermissions && permissions?.edit === true;
    const color = current?.color || "#dddddd";

    return (
        <div className="compact__row">
            <span
                className="compact__state"
                style={{ backgroundColor: color, color: isHexColorLight(color) ? "black" : "white" }}
            >
                {titleFormat(current?.text ?? "No state")}
            </span>
            {canChange ? (
                <select
                    className="compact__select"
                    style={{ width: "auto", flex: 1 }}
                    value={currentTag || ""}
                    disabled={isPending}
                    onChange={e => {
                        if (e.target.value) updateState({ tag: instrument_tag, instrument_state_tag: e.target.value });
                    }}
                >
                    {!currentTag ? <option value="">Select state…</option> : null}
                    {_.sortBy(allStates, "text").map(s => (
                        <option key={s.tag} value={s.tag}>{s.tag === currentTag ? "✔ " : ""}{s.text}</option>
                    ))}
                </select>
            ) : null}
        </div>
    );
}

/**
 * @description One maintenance event row: description and creation date.
 * @param {Object} props
 * @param {String} props.event_tag Maintenance event tag
 * @returns {JSX.Element} The event row.
 */
function MaintenanceEventRow({ event_tag }) {
    const { data: event } = api.maintenance.core.useGetMaintenanceEventByTag({ tag: event_tag }, { enabled: _.isString(event_tag) });
    if (!_.isObject(event)) return null;
    return (
        <div className="compact__chip" style={{ borderRadius: 8, alignItems: "flex-start" }} title={event.description}>
            <span>
                {_.isString(event.description) && event.description.length > 0 ? event.description : event_tag}
                {_.isNumber(event.created_at) ? (
                    <span className="compact__hint" style={{ display: "block" }}>{moment(event.created_at).format("YYYY-MM-DD HH:mm")}</span>
                ) : null}
            </span>
        </div>
    );
}

/**
 * @description Symptom option whose label is resolved from the symptom tag.
 * @param {Object} props
 * @param {String} props.symptom_tag Symptom tag
 * @returns {JSX.Element} The option element.
 */
function SymptomOption({ symptom_tag }) {
    const { data: text } = api.maintenance.symptoms.querySymptoms.useGetSymptomText({ tag: symptom_tag }, { enabled: _.isString(symptom_tag) });
    return <option value={symptom_tag}>{_.isString(text) ? text : symptom_tag}</option>;
}

/**
 * @description Maintenance events for one instrument: lists recent events and provides a
 * plain form to insert a new maintenance event (description, instrument state, symptoms).
 * @param {Object} props
 * @param {String} props.instrument_tag Instrument tag
 * @returns {JSX.Element} The maintenance event section.
 */
function InstrumentMaintenanceEvents({ instrument_tag }) {
    const queryClient = useQueryClient();
    const [description, setDescription] = useState("");
    const [stateTag, setStateTag] = useState("");
    const [symptomTags, setSymptomTags] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const { data: eventTags, refetch } = api.maintenance.core.useGetQueryMaintenanceEvents(
        { instrument_tag, limit: 20 }, { enabled: _.isString(instrument_tag) }
    );
    const { data: allStates } = api.instruments.core.useGetAllInstrumentStates();
    const { data: allSymptoms } = api.maintenance.symptoms.querySymptoms.useGetSymptomByQuery({ search_string: null, limit: 200 }, { staleTime: 300000 });
    const { data: permissions, isSuccess: isSuccessPermissions } = api.instruments.permissions.useGetInstrumentPermissions();
    const { mutate: postEvent, isPending } = api.maintenance.core.usePostMaintenanceEvent({
        onSuccess: () => {
            setDescription(""); setStateTag(""); setSymptomTags([]); setShowForm(false);
            queryClient.invalidateQueries({ queryKey: ["getQueryMaintenanceEvents"] });
            queryClient.invalidateQueries({ queryKey: ["getStatesOfAnInstrument"] });
            refetch();
        },
    });

    const canEdit = isSuccessPermissions && permissions?.edit === true;
    const canSubmit = canEdit && description.trim().length > 0 && _.isString(stateTag) && stateTag.length > 0 && !isPending;
    const symptomOptions = _.isArray(allSymptoms) ? allSymptoms.filter(t => !symptomTags.includes(t)) : [];

    return (
        <div className="compact__section">
            <div className="compact__row" style={{ justifyContent: "space-between" }}>
                <span className="compact__label">Maintenance events</span>
                {canEdit ? (
                    <button className="compact__button compact__button--ghost" onClick={() => setShowForm(v => !v)}>
                        {showForm ? "Close" : "+ New event"}
                    </button>
                ) : null}
            </div>
            {_.isArray(eventTags) && eventTags.length > 0 ? (
                <div className="compact__row">
                    {eventTags.map(event_tag => <MaintenanceEventRow key={event_tag} event_tag={event_tag} />)}
                </div>
            ) : <div className="compact__hint">No maintenance events.</div>}
            {showForm && canEdit ? (
                <div style={{ marginTop: "0.5rem" }}>
                    <textarea
                        className="compact__textarea"
                        placeholder="Describe the maintenance event…"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                    <div className="compact__row">
                        <select
                            className="compact__select"
                            value={stateTag}
                            onChange={e => setStateTag(e.target.value)}
                        >
                            <option value="">Instrument state…</option>
                            {_.isArray(allStates) ? _.sortBy(allStates, "text").map(s => (
                                <option key={s.tag} value={s.tag}>{s.text}</option>
                            )) : null}
                        </select>
                    </div>
                    <div className="compact__row">
                        {symptomTags.map(t => <SymptomChip key={t} symptom_tag={t} onRemove={() => setSymptomTags(prev => prev.filter(x => x !== t))} />)}
                    </div>
                    {symptomOptions.length > 0 ? (
                        <div className="compact__row">
                            <select
                                className="compact__select"
                                value=""
                                onChange={e => { if (e.target.value) setSymptomTags(prev => [...prev, e.target.value]); }}
                            >
                                <option value="">Add symptom…</option>
                                {symptomOptions.map(t => <SymptomOption key={t} symptom_tag={t} />)}
                            </select>
                        </div>
                    ) : null}
                    <div className="compact__row">
                        <button
                            className="compact__button"
                            disabled={!canSubmit}
                            onClick={() => postEvent({ description: description.trim(), instrument_tag, instrument_state_tag: stateTag, symptom_tags: symptomTags })}
                        >
                            Create event
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

/**
 * @description Chip showing a selected symptom with a remove button.
 * @param {Object} props
 * @param {String} props.symptom_tag Symptom tag
 * @param {Function} props.onRemove Remove callback
 * @returns {JSX.Element} The symptom chip.
 */
function SymptomChip({ symptom_tag, onRemove }) {
    const { data: text } = api.maintenance.symptoms.querySymptoms.useGetSymptomText({ tag: symptom_tag }, { enabled: _.isString(symptom_tag) });
    return (
        <span className="compact__chip">
            {_.isString(text) ? text : symptom_tag}
            <button className="compact__chip__remove" onClick={onRemove} title="Remove symptom">×</button>
        </span>
    );
}

/**
 * @description Compact instrument list grouped by instrument type, each allowing state changes
 * and maintenance event insertion.
 * @returns {JSX.Element} The instruments tab.
 */
export function CompactInstruments() {
    const { data: instrument_types, isLoading, isError, error } = api.instruments.core.useGetInstrumentTypes();

    return (
        <div>
            <div className="compact__hint" style={{ margin: "0 0 0.75rem" }}>
                Change instrument states — optimized for small screens.
            </div>
            {isLoading ? <div className="compact__hint">Loading…</div> : null}
            {isError ? <div className="compact__hint" style={{ color: "#cd4246" }}>{error?.message || "Failed to load instruments."}</div> : null}
            {_.isArray(instrument_types) ? instrument_types.map(type => (
                <InstrumentTypeSection key={type.tag} instrument_type={type.tag} type_label={type.text} />
            )) : null}
        </div>
    );
}

/**
 * @description All instruments of one type.
 * @param {Object} props
 * @param {String} props.instrument_type Instrument type tag
 * @param {String} props.type_label Instrument type label
 * @returns {JSX.Element} The instrument type section.
 */
function InstrumentTypeSection({ instrument_type, type_label }) {
    const { data: instruments } = api.instruments.core.useGetInstrumentsByType({ tag: instrument_type }, { enabled: _.isString(instrument_type) });
    return (
        <div style={{ marginBottom: "0.9rem" }}>
            <div className="compact__label" style={{ fontSize: "0.8rem", marginBottom: "0.35rem" }}>
                {type_label || instrument_type}
            </div>
            {_.isArray(instruments) ? instruments.map(instrument => (
                <div className="compact__card" key={instrument.tag}>
                    <p className="compact__card__title">{instrument.text}</p>
                    <span className="compact__tag">{instrument.tag}</span>
                    <InstrumentStateChanger instrument_tag={instrument.tag} />
                    <InstrumentMaintenanceEvents instrument_tag={instrument.tag} />
                </div>
            )) : null}
        </div>
    );
}
