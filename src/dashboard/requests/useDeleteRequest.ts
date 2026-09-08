import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { expireSession, FORBIDDEN_MESSAGE } from "../auth/sessionExpiry";

import { RequestsRequestError, deleteRequest } from "./requestsService";

export function useDeleteRequest() {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const removeRequest = async (id: string) => {
    setDeleting(true);

    try {
      await deleteRequest(id);
      message.success("Request deleted successfully.");
      return true;
    } catch (cause) {
      if (cause instanceof RequestsRequestError && cause.status === 401) {
        expireSession(navigate);
        return false;
      }

      if (cause instanceof RequestsRequestError && cause.status === 403) {
        message.error(FORBIDDEN_MESSAGE);
        return false;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not delete request.",
      );
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { removeRequest, deleting };
}
