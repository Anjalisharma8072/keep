import { Button, Divider, Title } from "@tremor/react";
import Select from "@/components/ui/Select";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useIncidents, usePollIncidents } from "../../utils/hooks/useIncidents";
import Loading from "../loading";
import { IncidentDto } from "./models";
import { useIncidentActions } from "@/entities/incidents/model/useIncidentActions";

interface ChangeSameIncidentInThePast {
  incident: IncidentDto;
  mutate: () => void;
  handleClose: () => void;
}

const ChangeSameIncidentInThePast = ({
  incident,
  mutate,
  handleClose,
}: ChangeSameIncidentInThePast) => {
  const { data: incidents, isLoading } = useIncidents(true, 100);
  usePollIncidents(mutate);

  const [selectedIncident, setSelectedIncident] = useState<
    string | undefined
  >();
  const { updateIncident } = useIncidentActions();
  const router = useRouter();

  const associateIncidentHandler = async (
    selectedIncidentId: string | null
  ) => {
    try {
      await updateIncident(
        incident.id,
        {
          same_incident_in_the_past_id: selectedIncidentId,
        },
        false
      );
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLinkIncident = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) {
      return;
    }
    associateIncidentHandler(selectedIncident);
  };

  const handleUnlinkIncident = (e: FormEvent) => {
    e.preventDefault();
    associateIncidentHandler(null);
  };

  return (
    <div className="relative bg-white p-6 rounded-lg">
      {isLoading ? (
        <Loading />
      ) : incidents && incidents.items.length > 0 ? (
        <div className="h-full justify-center">
          <Select
            className="my-2.5"
            placeholder="Select incident"
            value={
              selectedIncident
                ? {
                    value: selectedIncident,
                    label:
                      incidents.items.find(
                        (incident) => incident.id === selectedIncident
                      )?.user_generated_name ||
                      incidents.items.find(
                        (incident) => incident.id === selectedIncident
                      )?.ai_generated_name ||
                      "",
                  }
                : null
            }
            onChange={(selectedOption) =>
              setSelectedIncident(selectedOption?.value)
            }
            options={incidents.items
              ?.filter(
                (incident_iteration_on) =>
                  incident_iteration_on.id !== incident.id
              )
              .map((incident_iteration_on) => ({
                value: incident_iteration_on.id,
                label:
                  incident_iteration_on.user_generated_name ||
                  incident_iteration_on.ai_generated_name ||
                  "",
              }))}
          />
          <Divider />
          <div className="flex items-center justify-between gap-6">
            <Button
              className="flex-1"
              color="red"
              onClick={handleUnlinkIncident}
              disabled={selectedIncident === null}
            >
              Unlink
            </Button>
            <Button
              className="flex-1"
              color="orange"
              onClick={handleLinkIncident}
              disabled={selectedIncident === null}
            >
              Link and help AI 🤗
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-y-8 h-full">
          <div className="text-center space-y-3">
            <Title className="text-2xl">No Incidents Yet</Title>
          </div>

          <div className="flex items-center justify-between w-full gap-6">
            <Button
              className="flex-1"
              color="orange"
              onClick={() => router.push("/incidents")}
            >
              Incidents page
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeSameIncidentInThePast;
