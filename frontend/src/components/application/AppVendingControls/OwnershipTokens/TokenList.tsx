import { Disclosure } from "@headlessui/react"
import { useTranslation } from "next-i18next"
import {
  FunctionComponent,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react"
import { getVendingTokens } from "../../../../asyncs/vending"
import { Appstream } from "../../../../types/Appstream"
import Spinner from "../../../Spinner"
import TokenCreateDialog from "./TokenCreateDialog"
import TokenListItem from "./TokenListItem"

interface Props {
  app: Appstream
}

/**
 * The control elements to view and add/cancel ownership tokens for an app.
 */
const TokenList: FunctionComponent<Props> = ({ app }) => {
  const { t } = useTranslation()

  const [tokens, setTokens] = useState(null)
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle")
  const [error, setError] = useState(null)

  const doFetch = useCallback(async () => {
    try {
      const fetch = await getVendingTokens(app.id)
      setTokens(fetch)
      setStatus("success")
    } catch (err) {
      setStatus("error")
      setError(err)
    }
  }, [app.id])

  useEffect(() => {
    doFetch()
  }, [app.id, doFetch])

  if (["pending", "idle"].includes(status)) {
    return <Spinner size="m" />
  }

  let content: ReactElement
  if (error) {
    content = <p>{t(error)}</p>
  } else {
    content = (
      <div className="flex flex-col gap-2 rounded-2xl bg-flathub-white p-2 dark:bg-flathub-arsenic">
        {tokens?.tokens.map((token) => (
          <Disclosure key={token.id}>
            {({ open }) => (
              <TokenListItem open={open} token={token} appId={app.id} />
            )}
          </Disclosure>
        ))}
        <TokenCreateDialog app={app} updateCallback={doFetch} />
      </div>
    )
  }

  return (
    <>
      <h2 className="mb-6 text-2xl font-bold">{t("ownership-tokens")}</h2>
      {content}
    </>
  )
}

export default TokenList
