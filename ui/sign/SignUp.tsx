"use client"
import type React from "react"
import { useRef, useState, type ChangeEvent } from "react"

import { appContext } from "@/types/appContext"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { Dropdown, type DropdownChangeEvent } from "primereact/dropdown"
import { Button } from "primereact/button"
import { Toast } from "primereact/toast"
import { InputText } from "primereact/inputtext"
import { Dialog } from "primereact/dialog"
import { Password } from "primereact/password"
import { Divider } from "primereact/divider"

import { useRouter } from "next/navigation"

interface Users {
  users: {
    id: string
    userName: string
    userEmail: string
    userPassword: string
    companyName: string
    city: string
  }[]
}
interface FormData {
  id: string
  userName: string
  userEmail: string
  userPassword: string
  companyName: string
  city: string
}

interface City {
  value: string
  label: string
}

const SignUp = ({ users }: Users) => {
  // Router
  const router = useRouter()
  const searchParams = useSearchParams()
  const companyNameFromSearchParam = searchParams?.get("company")?.replace(/\s/g, "")

  // Notification
  const toast = useRef<Toast>(null)
  // Button state
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false)
  const [isModalButtonLoading, setIsModalButtonLoading] = useState<boolean>(false)

  // Form data
  const [checkUserName, setCheckUserName] = useState("")
  const [checkUserEmail, setCheckUserEmail] = useState("")
  const [checkUserPwd, setCheckUserPwd] = useState("")
  const [checkCompanyName, setCheckCompanyName] = useState("")
  const [checkCity, setCheckCity] = useState("")
  const cities: City[] = [
    { value: "Paris", label: "Paris" },
    { value: "Marseille", label: "Marseille" },
    { value: "Lyon", label: "Lyon" },
    { value: "Toulouse", label: "Toulouse" },
    { value: "Nice", label: "Nice" },
    { value: "Nantes", label: "Nantes" },
    { value: "Montpellier", label: "Montpellier" },
    { value: "Strasbourg", label: "Strasbourg" },
    { value: "Bordeaux", label: "Bordeaux" },
    { value: "Lille", label: "Lille" },
    { value: "Rennes", label: "Rennes" },
    { value: "Reims", label: "Reims" },
    { value: "Toulon", label: "Toulon" },
    { value: "Saint-Etienne", label: "Saint-Etienne" },
    { value: "Le Havre", label: "Le Havre" },
    { value: "Dijon", label: "Dijon" },
    { value: "Grenoble", label: "Grenoble" },
    { value: "Villeurbanne", label: "Villeurbanne" },
    { value: "Saint-Denis (La Réunion)", label: "Saint-Denis (La Réunion)" },
  ]

  const handleCity = (option: City, props) => {
    if (option) {
      return (
        <div className="align-items-center flex text-lg">
          {/* <img
            alt={option.label}
            src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png"
            className={`flag mr-2 flag-${option.label.toLowerCase()}`}
            style={{ width: '18px' }}
          /> */}
          <div>{option.label}</div>
        </div>
      )
    }
    return <span className="text-lg">{props.placeholder}</span>
  }
  const cityOption = (option: City) => {
    return (
      <div className="align-items-center flex text-lg">
        {/* <img
          alt={option.label}
          src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png"
          className={`flag mr-2 flag-${option.label.toLowerCase()}`}
          style={{ width: '18px' }}
        /> */}
        <div>{option.label}</div>
      </div>
    )
  }

  const pwdHeader = (
    <div className="mb-4 font-bold text-lg">
      Politique relative aux mots de passe : exigences en matière de sécurité
    </div>
  )
  const pwdFooter = (
    <>
      <Divider />
      <p className="mt-3 text-base">Votre mot de passe doit remplir toutes les conditions ci-dessous :</p>
      <ul className="line-height-3 ml-3 mt-2 pl-3 text-base">
        <li>Au moins une minuscule</li>
        <li>Au moins une majuscule</li>
        <li>Au moins un chiffre</li>
        <li>Minimum 8 caractères</li>
      </ul>
    </>
  )

  // App Context
  const createUserUrl: string = appContext.appUrl + "/api/createUser"
  const manageVerificationUrl: string = appContext.appUrl + "/api/manageVerification"

  // Typesafe pay form + modal
  const [modalVis, setModalVis] = useState(false)
  const [storedEmail, setStoredEmail] = useState("")
  const [state, setState] = useState({ value: "" })
  const handleChange = (event: ChangeEvent<{ value: string }>) => {
    setState({ value: event?.currentTarget?.value })
  }
  const comparePinCode = async () => {
    // console.log('comparePinCode()');
    const filledPinCode: string = state.value
    const dataToVerify: string = `${filledPinCode},${storedEmail},${checkUserName},${checkCompanyName},${checkCity}`

    fetch(manageVerificationUrl, {
      body: JSON.stringify(dataToVerify),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // authorization: `bearer ${session?.user?.accessToken}`,
      },
      method: "POST",
    }).then((res) => {
      var stringifiedRes = JSON.stringify(res.ok)
      if (stringifiedRes == "true") {
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Le code PIN entré est correcte",
          life: 5000,
        })
        setModalVis(false)
        router.replace(appContext.appUrl + "/sign")
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Le code PIN entré est incorrecte",
          life: 5000,
        })
      }
    })
    // await manageVerification(dataToVerify).then((data) => {
    //   setPinCodeComparison(data.message);
    // });
  }

  const handleModal = async () => {
    try {
      // console.log('handleModal()');
      setIsModalButtonLoading(true)
      await comparePinCode()
      setIsModalButtonLoading(false)
    } catch (error) {
      return error
    }
  }
  async function create(data: FormData) {
    try {
      // console.log(data);
      fetch(createUserUrl, {
        body: JSON.stringify({
          email: data.userEmail,
          password: data.userPassword,
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // authorization: `bearer ${session?.user?.accessToken}`,
        },
        method: "POST",
      }).then(() =>
        // clear the form
        setForm({
          id: "",
          userName: "",
          userEmail: "",
          userPassword: "",
          companyName: "",
          city: "",
        }),
      )
    } catch (error) {
      return error
    }
  }

  // Typesafe register form
  const [form, setForm] = useState<FormData>({
    id: "",
    userName: "",
    userEmail: "",
    userPassword: "",
    companyName: "",
    city: "",
  })
  function formatJsonData(jsonData) {
    const arrayLength = Object.keys(jsonData).length
    let dataToDisplay = ""
    for (let i = 0; i < arrayLength; i++) {
      dataToDisplay += jsonData[i].name + ", "
    }
    return dataToDisplay
  }
  function checkForm(data: FormData) {
    // console.log('data:' + JSON.stringify(data));
    // console.log('country:' + data.companyCountry.name);
    // console.log('departments::' + data.companyDepartments);
    // console.log('main act:' + data.companyMainActivity);
    // console.log('name:' + data.companyName);
    // console.log('workflows:' + data.companyProjectWorkflows);
    // console.log('projects amount:' + data.companyProjectsAmount);
    // console.log('projects methodo:' + data.companyProjectsMethodologies);
    // console.log('sector of act:' + data.companySectorOfActivity.name);
    // console.log('size:' + data.companySize);
    // console.log('widgets:' + data.companyWidgets);
    // console.log('biz network:' + data.companyBusinessNetwork);
    // console.log('id:' + data.id);
    // console.log('email:' + data.userEmail);
    // console.log('name:' + data.userName);
    // console.log('pwd:' + data.userPassword);

    setCheckUserName(data.userName) // replace spaces by - to have first name or last name of full name in one colomn
    setCheckUserEmail(data.userEmail)
    setCheckUserPwd(data.userPassword)
    setCheckCompanyName(data.companyName)
    setCheckCity(data.city)
  }

  const handleSubmit = async (data: FormData) => {
    try {
      setIsButtonLoading(true)
      checkForm(data)
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
      await sleep(1000)
      if (
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.userEmail) &&
        /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})./.test(
          data.userPassword,
        )
      ) {
        await sleep(1000)
        setStoredEmail(data.userEmail) // will be used for comparePinCode() onClick of pin code verification through pay modal
        await create(data) // used to create() user with parameter of data from form: email, password, etc.
        setModalVis(true)
        await sleep(2000)
        // await sendVerificationEmail(data);
        setIsButtonLoading(false)
        toast.current?.show({
          severity: "info",
          summary: "Info",
          detail: "Veuillez vérifier votre adresse e-mail avec la clé que vous avez reçue par e-mail",
          sticky: true,
        })
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail:
            "Veuillez vérifier que votre email, votre mot de passe ainsi que tous les champs mis en évidences sont bien remplis et correspondent aux exigences",
          life: 5000,
        })
        setModalVis(false)
      }
    } catch (error) {
      return error
    }
  }

  // Automatically fill company name is searchParams
  if (companyNameFromSearchParam && companyNameFromSearchParam !== null && companyNameFromSearchParam !== undefined) {
    form.companyName = companyNameFromSearchParam
  }

  return (
    <div className="flex min-h-full flex-col justify-center">
      <Toast ref={toast} />
      <Dialog
        header="Enregistrement"
        visible={modalVis}
        onHide={() => setModalVis(false)}
        style={{ width: "75vw" }} // centered modal
        breakpoints={{ "960px": "75vw", "641px": "100vw" }} // responsive
        maximizable
        closeOnEscape={false}
        closable={false}
      >
        <div className="m-0">
          <div className="mx-auto mt-1 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-1 lg:mx-0 lg:flex lg:max-w-none">
            <div className="p-10 sm:p-12 lg:flex-auto">
              <h3 className="text-3xl font-bold tracking-tight text-gray-900">Vérifier les détails:</h3>
              <p className="mt-8 text-lg leading-7 text-gray-600">
                <div>
                  <div className="grid">
                    <span className="p-float-label">
                      <InputText
                        onChange={handleChange}
                        tooltip="Entrez le code pin reçu par email"
                        tooltipOptions={{
                          event: "both",
                          position: "top",
                        }}
                        required
                        className="text-lg py-3"
                      />
                      <label className="text-lg">Code PIN</label>
                      <small id="username-help" className="text-base">
                        Ce code PIN est à conserver car vous sera potentiellement demander ultérieurement à
                        l'utilisation de certains widgets et fonctionnalités
                      </small>
                    </span>
                  </div>
                </div>
              </p>
              <div className="mt-12 flex items-center gap-x-4">
                <h4 className="flex-none text-lg font-semibold leading-6 text-indigo-600">Résumé</h4>
                <div className="h-px flex-auto bg-gray-100"></div>
              </div>
              <ul
                role="list"
                className="mt-10 grid grid-cols-1 gap-4 text-lg leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6"
              >
                <li className="flex gap-x-3">
                  {checkUserName}, {checkUserEmail}: {checkCompanyName}
                </li>
              </ul>
            </div>
            <div className="mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
              <div className="rounded-2xl bg-gray-50 py-12 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-20">
                <div className="mx-auto max-w-xs px-8">
                  <Button
                    label="Accéder à Beauté du geste"
                    onClick={handleModal}
                    // size="small"
                    outlined
                    // raised
                    // rounded
                    iconPos="right"
                    icon="pi pi-file-edit"
                    className="mt-12 text-lg px-6 py-3"
                    loading={isModalButtonLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      <div className="mt-16 sm:mx-auto sm:w-full sm:max-w-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault() // don't wanna call the default form actions, otherwise refresh the page
            handleSubmit(form) // call arrow function to submit
          }}
          className="space-y-8"
          method="POST"
        >
          <div className="mt-3">
            <span className="p-float-label block">
              <InputText
                value={form.userName}
                // keyfilter="alpha" // to avoid spaces
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, userName: e.target.value })}
                tooltip="Entrez votre prénom et nom"
                tooltipOptions={{ event: "both", position: "top" }}
                required
                className="text-lg py-3"
              />
              <label className="text-lg">Prénom et nom</label>
            </span>
          </div>
          <div className="mt-6">
            <span className="p-float-label block">
              <InputText
                value={form.userEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, userEmail: e.target.value })}
                keyfilter="email"
                tooltip="Entrez votre adresse email"
                tooltipOptions={{ event: "both", position: "top" }}
                required
                className="text-lg py-3"
              />
              <label className="text-lg">Email</label>
            </span>
          </div>
          <div className="mt-6">
            <span className="p-float-label">
              <Password
                inputId="password"
                value={form.userPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, userPassword: e.target.value })
                }
                required
                feedback={true}
                header={pwdHeader}
                footer={pwdFooter}
                toggleMask
                tooltip="Entrez votre mot de passe qui correspond aux exigences de sécurité"
                tooltipOptions={{
                  event: "both",
                  position: "top",
                }}
                className="text-lg"
                inputClassName="text-lg py-3"
              />
              <label className="text-lg">Mot de passe</label>
            </span>
          </div>

          <div className="mt-6">
            <span className="p-float-label block">
              <InputText
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                tooltip="Entrez le nom de votre entreprise"
                tooltipOptions={{ event: "both", position: "top" }}
                required
                keyfilter="alphanum"
                className="text-lg py-3"
              />
              <label className="text-lg">Nom d'entreprise</label>
            </span>
          </div>

          <div className="mt-6 w-full">
            <Dropdown
              value={form.city}
              onChange={(e: DropdownChangeEvent) => setForm({ ...form, city: e.target.value })}
              options={cities}
              optionLabel="label"
              placeholder="Ville"
              filter
              valueTemplate={handleCity}
              itemTemplate={cityOption}
              className="w-full text-lg"
              required
            />
          </div>

          <div className="text-base">
            <p className="mt-12 text-center text-base text-white">
              Vous souhaitez lire les CGU ainsi que la politique de confidentialité ?&nbsp;
              <Link href="/cgu" className="formLinks font-semibold leading-6 text-green-600 hover:text-green-500">
                Cliquez ici
              </Link>
            </p>
          </div>

          <div className="mt-8 w-full justify-center text-center">
            <Button
              type="submit"
              label="S'inscrire"
              loading={isButtonLoading}
              className="text-lg px-8 py-4"
              pt={{
                root: { className: "bg-green-500 border-green-500 text-lg" },
              }}
            />
          </div>
        </form>
      </div>
    </div>
  )
}
export default SignUp
