// src/pages/medical-records/UploadDocumentPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Button from "../../components/common/Button/Button";
import InputField from "../../components/common/InputField/InputField";
import SelectField from "../../components/common/SelectField/SelectField";
import Alert from "../../components/common/Alert/Alert";

// Schéma de validation
const documentSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  type: z.string().min(1, "Le type de document est requis"),
  date: z.string().min(1, "La date est requise"),
  description: z.string().optional(),
  // Le champ de fichier est géré séparément
});

type FormData = z.infer<typeof documentSchema>;

const UploadDocumentPage: React.FC = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const patientId = queryParams.get("patientId");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordTitle, setRecordTitle] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      type: "",
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    // Si nous avons un recordId, récupérer les infos du dossier
    if (recordId) {
      // Simulation de récupération des données du dossier
      const fetchRecord = async () => {
        try {
          // Simuler un délai réseau
          await new Promise((resolve) => setTimeout(resolve, 500));

          // En situation réelle, nous ferions un appel API
          // Données simulées
          setRecordTitle("Consultation initiale");
        } catch (error) {
          console.error("Error fetching record:", error);
          setError("Erreur lors du chargement des informations du dossier");
        }
      };

      fetchRecord();
    }
  }, [recordId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!selectedFile) {
      setError("Veuillez sélectionner un fichier à télécharger");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Simuler le téléchargement
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // En environnement réel, nous utiliserions :
      // const formData = new FormData();
      // formData.append('file', selectedFile);
      // formData.append('title', data.title);
      // formData.append('type', data.type);
      // formData.append('date', data.date);
      // formData.append('description', data.description || '');

      // if (recordId) {
      //   await medicalRecordService.uploadDocument(recordId, formData);
      // } else {
      //   // Créer un nouveau dossier avec ce document
      //   const newRecord = await medicalRecordService.createRecord({
      //     patientId: patientId || "",
      //     title: data.title,
      //     date: data.date,
      //     documents: [formData]
      //   });
      // }

      toast.success("Document téléchargé avec succès");

      // Rediriger vers la page appropriée
      if (recordId) {
        navigate(`/medical-records/${recordId}`);
      } else if (patientId) {
        navigate(`/medical-records?patientId=${patientId}`);
      } else {
        navigate("/medical-records");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      setError("Une erreur est survenue lors du téléchargement du document");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-neutral-900">
          {recordId
            ? `Ajouter un document à "${recordTitle}"`
            : "Télécharger un nouveau document"}
        </h1>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-outline inline-flex items-center"
        >
          <svg
            className="h-5 w-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Retour
        </button>
      </div>

      {error && (
        <Alert variant="error" message={error} onClose={() => setError(null)} />
      )}

      {/* Formulaire */}
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              id="title"
              label="Titre du document"
              {...register("title")}
              error={errors.title?.message}
              required
            />

            <InputField
              id="date"
              label="Date du document"
              type="date"
              {...register("date")}
              error={errors.date?.message}
              required
            />

            <SelectField
              id="type"
              label="Type de document"
              {...register("type")}
              error={errors.type?.message}
              options={[
                { value: "rapport", label: "Rapport médical" },
                { value: "ordonnance", label: "Ordonnance" },
                { value: "analyse", label: "Résultats d'analyse" },
                { value: "radiologie", label: "Imagerie médicale" },
                { value: "autre", label: "Autre" },
              ]}
              required
            />

            <div className="md:col-span-2">
              <label className="label">
                Document
                <span className="text-error-500 ml-1">*</span>
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-neutral-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-neutral-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                    >
                      <span>Télécharger un fichier</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                    </label>
                    <p className="pl-1">ou glisser-déposer</p>
                  </div>
                  <p className="text-xs text-neutral-500">
                    PDF, PNG, JPG, DOCX jusqu'à 10MB
                  </p>
                  {selectedFile && (
                    <p className="text-sm text-green-600 mt-2">
                      Fichier sélectionné: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="label">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                {...register("description")}
                className="input"
                placeholder="Description optionnelle du document"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isUploading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isUploading}
              disabled={isUploading || !selectedFile}
            >
              {isUploading ? "Téléchargement..." : "Télécharger le document"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadDocumentPage;
