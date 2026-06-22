import { useWsClient } from "../../api/hooks/useWsClient";
import "bootstrap-icons/font/bootstrap-icons.css";

function IngestionReload() {
  const { sendIngestionQuery, progress } = useWsClient();

  return (
    <div className="d-flex align-items-center gap-2">
      <button onClick={sendIngestionQuery} className="btn btn-primary btn-sm">
        <i className="bi bi-arrow-clockwise"></i>
      </button>
      {progress > 0 ? (
        <div
          className="progress flex-grow-1 align-self-stretch"
          style={{ height: "unset" }}
        >
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${progress}%` }}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
      ) : (
        <small className="text-body-secondary">Ringest emails</small>
      )}
    </div>
  );
}

export default IngestionReload;
