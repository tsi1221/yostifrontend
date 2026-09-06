import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import {
  RequestsRequestError,
  deleteRequest,
  isPreviewAccessToken,
} from "./requestsService";

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
        if (isPreviewAccessToken(getAccessToken())) {
          message.error("Sign in with a live Super Admin account to delete this request.");
          return false;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return false;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not delete request."
      );
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { removeRequest, deleting };
}
